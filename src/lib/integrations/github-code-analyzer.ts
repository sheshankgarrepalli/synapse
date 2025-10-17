/**
 * GitHub Code Analyzer
 * Analyzes React/TypeScript components to extract design properties
 * for comparison with Figma designs (Design-Code Drift Detection)
 */

import { Octokit } from '@octokit/rest';
import { logger } from '@/lib/logger';
import * as ts from 'typescript';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';

export interface CodeProperties {
  colors: {
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    fills?: string[];
  };
  spacing: {
    padding?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    gap?: number;
  };
  typography?: {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string | number;
    lineHeight?: string | number;
  };
  size?: {
    width?: number | string;
    height?: number | string;
  };
  layout?: {
    display?: string;
    flexDirection?: string;
    justifyContent?: string;
    alignItems?: string;
  };
}

export interface ComponentAnalysis {
  componentName: string;
  filePath: string;
  properties: CodeProperties;
  imports: string[];
  exports: string[];
  dependencies: string[];
}

export class GitHubCodeAnalyzer {
  private octokit: Octokit;

  constructor(accessToken: string) {
    this.octokit = new Octokit({ auth: accessToken });
  }

  /**
   * Fetch file content from GitHub repository
   */
  async fetchFileContent(owner: string, repo: string, path: string, ref?: string): Promise<string> {
    try {
      const response = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
        ref: ref || 'main',
      });

      if ('content' in response.data) {
        return Buffer.from(response.data.content, 'base64').toString('utf-8');
      }

      throw new Error('File content not found');
    } catch (error) {
      logger.error('Error fetching GitHub file', { error, owner, repo, path });
      throw error;
    }
  }

  /**
   * Analyze a React/TypeScript component file
   */
  async analyzeComponent(fileContent: string, filePath: string): Promise<ComponentAnalysis> {
    const isTypeScript = filePath.endsWith('.tsx') || filePath.endsWith('.ts');
    const isJavaScript = filePath.endsWith('.jsx') || filePath.endsWith('.js');

    if (!isTypeScript && !isJavaScript) {
      throw new Error('Unsupported file type. Only .ts, .tsx, .js, .jsx files are supported.');
    }

    // Extract component name from file path
    const componentName = this.extractComponentName(filePath);

    // Parse the file
    const ast = this.parseFile(fileContent, isTypeScript);

    // Extract properties
    const properties = this.extractProperties(ast, fileContent);
    const imports = this.extractImports(ast);
    const exports = this.extractExports(ast);
    const dependencies = this.extractDependencies(imports);

    return {
      componentName,
      filePath,
      properties,
      imports,
      exports,
      dependencies,
    };
  }

  /**
   * Parse file into AST using Babel
   */
  private parseFile(content: string, isTypeScript: boolean): any {
    try {
      return parser.parse(content, {
        sourceType: 'module',
        plugins: [
          'jsx',
          isTypeScript ? 'typescript' : 'flow',
          'classProperties',
          'decorators-legacy',
          'objectRestSpread',
          'optionalChaining',
          'nullishCoalescingOperator',
        ],
      });
    } catch (error) {
      logger.error('Error parsing file', { error });
      throw error;
    }
  }

  /**
   * Extract component name from file path
   */
  private extractComponentName(filePath: string): string {
    const fileName = filePath.split('/').pop() || '';
    return fileName.replace(/\.(tsx?|jsx?)$/, '');
  }

  /**
   * Extract design properties from AST
   */
  private extractProperties(ast: any, sourceCode: string): CodeProperties {
    const properties: CodeProperties = {
      colors: {},
      spacing: {},
      typography: {},
      size: {},
      layout: {},
    };

    // Find className, style props, and CSS-in-JS
    traverse(ast, {
      // JSX Elements
      JSXElement: (path: any) => {
        const attributes = path.node.openingElement.attributes;

        attributes.forEach((attr: any) => {
          if (attr.type !== 'JSXAttribute') return;

          // className attribute
          if (attr.name.name === 'className') {
            this.extractTailwindClasses(attr, properties);
          }

          // style attribute
          if (attr.name.name === 'style') {
            this.extractInlineStyles(attr, properties);
          }
        });
      },

      // CSS-in-JS (styled-components, emotion)
      TaggedTemplateExpression: (path: any) => {
        if (path.node.tag.name === 'styled' || path.node.tag.object?.name === 'styled') {
          this.extractStyledComponentCSS(path.node.quasi.quasis, properties);
        }
      },

      // Object styles (React Native, CSS-in-JS objects)
      ObjectExpression: (path: any) => {
        const parent = path.parent;
        if (
          parent.type === 'CallExpression' &&
          (parent.callee.name === 'makeStyles' ||
            parent.callee.name === 'createStyles' ||
            parent.callee.name === 'StyleSheet.create')
        ) {
          this.extractObjectStyles(path.node, properties);
        }
      },
    });

    return properties;
  }

  /**
   * Extract Tailwind CSS classes
   */
  private extractTailwindClasses(attr: any, properties: CodeProperties): void {
    if (attr.value.type === 'StringLiteral') {
      const classes = attr.value.value.split(' ');

      classes.forEach((cls: string) => {
        // Background colors
        if (cls.startsWith('bg-')) {
          const color = this.tailwindColorToHex(cls);
          if (color) properties.colors.backgroundColor = color;
        }

        // Text colors
        if (cls.startsWith('text-') && !cls.includes('text-xs') && !cls.includes('text-sm')) {
          const color = this.tailwindColorToHex(cls);
          if (color) properties.colors.textColor = color;
        }

        // Border colors
        if (cls.startsWith('border-') && !cls.includes('border-t') && !cls.includes('border-b')) {
          const color = this.tailwindColorToHex(cls);
          if (color) properties.colors.borderColor = color;
        }

        // Padding
        if (cls.startsWith('p-') || cls.startsWith('px-') || cls.startsWith('py-')) {
          this.extractTailwindSpacing(cls, properties, 'padding');
        }

        // Margin
        if (cls.startsWith('m-') || cls.startsWith('mx-') || cls.startsWith('my-')) {
          this.extractTailwindSpacing(cls, properties, 'margin');
        }

        // Gap
        if (cls.startsWith('gap-')) {
          const value = this.tailwindSpacingToPixels(cls.replace('gap-', ''));
          if (value) properties.spacing.gap = value;
        }

        // Typography
        if (cls.startsWith('text-')) {
          this.extractTailwindTypography(cls, properties);
        }

        // Layout
        if (cls.startsWith('flex')) {
          this.extractTailwindLayout(cls, properties);
        }

        // Size
        if (cls.startsWith('w-')) {
          const value = this.tailwindSizeToValue(cls.replace('w-', ''));
          if (value) properties.size!.width = value;
        }
        if (cls.startsWith('h-')) {
          const value = this.tailwindSizeToValue(cls.replace('h-', ''));
          if (value) properties.size!.height = value;
        }
      });
    }
  }

  /**
   * Extract inline styles from style prop
   */
  private extractInlineStyles(attr: any, properties: CodeProperties): void {
    if (attr.value.expression && attr.value.expression.type === 'ObjectExpression') {
      const styleObj = attr.value.expression;
      this.extractObjectStyles(styleObj, properties);
    }
  }

  /**
   * Extract CSS from styled-components template literal
   */
  private extractStyledComponentCSS(quasis: any[], properties: CodeProperties): void {
    const cssString = quasis.map((q: any) => q.value.raw).join('');

    // Parse CSS string for common properties
    const cssRules = this.parseCSS(cssString);

    Object.entries(cssRules).forEach(([key, value]) => {
      this.mapCSSPropertyToDesignProperty(key, value as string, properties);
    });
  }

  /**
   * Extract styles from object expression
   */
  private extractObjectStyles(objExpr: any, properties: CodeProperties): void {
    objExpr.properties.forEach((prop: any) => {
      if (prop.key && prop.value) {
        const key = prop.key.name || prop.key.value;
        let value: any;

        if (prop.value.type === 'StringLiteral') {
          value = prop.value.value;
        } else if (prop.value.type === 'NumericLiteral') {
          value = prop.value.value;
        }

        this.mapCSSPropertyToDesignProperty(key, value, properties);
      }
    });
  }

  /**
   * Map CSS property to design property
   */
  private mapCSSPropertyToDesignProperty(key: string, value: string | number, properties: CodeProperties): void {
    const camelKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

    // Colors
    if (camelKey === 'backgroundColor' || camelKey === 'background') {
      properties.colors.backgroundColor = String(value);
    }
    if (camelKey === 'color') {
      properties.colors.textColor = String(value);
    }
    if (camelKey === 'borderColor') {
      properties.colors.borderColor = String(value);
    }

    // Spacing
    if (camelKey === 'padding') {
      const px = this.cssSizeToPixels(String(value));
      if (px !== null) {
        properties.spacing.padding = { top: px, right: px, bottom: px, left: px };
      }
    }
    if (camelKey === 'paddingTop') {
      const px = this.cssSizeToPixels(String(value));
      if (px !== null) {
        properties.spacing.padding = properties.spacing.padding || {};
        properties.spacing.padding.top = px;
      }
    }
    if (camelKey === 'paddingRight') {
      const px = this.cssSizeToPixels(String(value));
      if (px !== null) {
        properties.spacing.padding = properties.spacing.padding || {};
        properties.spacing.padding.right = px;
      }
    }
    if (camelKey === 'paddingBottom') {
      const px = this.cssSizeToPixels(String(value));
      if (px !== null) {
        properties.spacing.padding = properties.spacing.padding || {};
        properties.spacing.padding.bottom = px;
      }
    }
    if (camelKey === 'paddingLeft') {
      const px = this.cssSizeToPixels(String(value));
      if (px !== null) {
        properties.spacing.padding = properties.spacing.padding || {};
        properties.spacing.padding.left = px;
      }
    }
    if (camelKey === 'gap') {
      const px = this.cssSizeToPixels(String(value));
      if (px !== null) {
        properties.spacing.gap = px;
      }
    }

    // Typography
    if (camelKey === 'fontFamily') {
      properties.typography!.fontFamily = String(value);
    }
    if (camelKey === 'fontSize') {
      const px = this.cssSizeToPixels(String(value));
      if (px !== null) {
        properties.typography!.fontSize = px;
      }
    }
    if (camelKey === 'fontWeight') {
      properties.typography!.fontWeight = value;
    }
    if (camelKey === 'lineHeight') {
      properties.typography!.lineHeight = value;
    }

    // Size
    if (camelKey === 'width') {
      properties.size!.width = value;
    }
    if (camelKey === 'height') {
      properties.size!.height = value;
    }

    // Layout
    if (camelKey === 'display') {
      properties.layout!.display = String(value);
    }
    if (camelKey === 'flexDirection') {
      properties.layout!.flexDirection = String(value);
    }
    if (camelKey === 'justifyContent') {
      properties.layout!.justifyContent = String(value);
    }
    if (camelKey === 'alignItems') {
      properties.layout!.alignItems = String(value);
    }
  }

  /**
   * Simple CSS parser
   */
  private parseCSS(cssString: string): Record<string, string> {
    const rules: Record<string, string> = {};
    const regex = /([a-z-]+)\s*:\s*([^;]+)/g;
    let match;

    while ((match = regex.exec(cssString)) !== null) {
      rules[match[1].trim()] = match[2].trim();
    }

    return rules;
  }

  /**
   * Convert Tailwind color class to hex
   */
  private tailwindColorToHex(className: string): string | null {
    const colorMap: Record<string, string> = {
      'bg-white': '#ffffff',
      'bg-black': '#000000',
      'bg-gray-50': '#f9fafb',
      'bg-gray-100': '#f3f4f6',
      'bg-gray-200': '#e5e7eb',
      'bg-gray-300': '#d1d5db',
      'bg-gray-400': '#9ca3af',
      'bg-gray-500': '#6b7280',
      'bg-gray-600': '#4b5563',
      'bg-gray-700': '#374151',
      'bg-gray-800': '#1f2937',
      'bg-gray-900': '#111827',
      'bg-blue-500': '#3b82f6',
      'bg-blue-600': '#2563eb',
      'bg-green-500': '#10b981',
      'bg-red-500': '#ef4444',
      'text-white': '#ffffff',
      'text-black': '#000000',
      'text-gray-400': '#9ca3af',
      'text-gray-500': '#6b7280',
      'text-gray-600': '#4b5563',
      'text-gray-700': '#374151',
      'text-gray-800': '#1f2937',
      'text-gray-900': '#111827',
      'border-gray-200': '#e5e7eb',
      'border-gray-700': '#374151',
    };

    return colorMap[className] || null;
  }

  /**
   * Extract Tailwind spacing
   */
  private extractTailwindSpacing(className: string, properties: CodeProperties, type: 'padding' | 'margin'): void {
    const match = className.match(/^(p|m|px|py|mx|my)-(\d+\.?\d*)$/);
    if (!match) return;

    const [, prefix, value] = match;
    const pixels = this.tailwindSpacingToPixels(value);

    if (pixels === null) return;

    if (type === 'padding') {
      properties.spacing.padding = properties.spacing.padding || {};
      if (prefix === 'p') {
        properties.spacing.padding = { top: pixels, right: pixels, bottom: pixels, left: pixels };
      } else if (prefix === 'px') {
        properties.spacing.padding.left = pixels;
        properties.spacing.padding.right = pixels;
      } else if (prefix === 'py') {
        properties.spacing.padding.top = pixels;
        properties.spacing.padding.bottom = pixels;
      }
    }

    if (type === 'margin') {
      properties.spacing.margin = properties.spacing.margin || {};
      if (prefix === 'm') {
        properties.spacing.margin = { top: pixels, right: pixels, bottom: pixels, left: pixels };
      } else if (prefix === 'mx') {
        properties.spacing.margin.left = pixels;
        properties.spacing.margin.right = pixels;
      } else if (prefix === 'my') {
        properties.spacing.margin.top = pixels;
        properties.spacing.margin.bottom = pixels;
      }
    }
  }

  /**
   * Extract Tailwind typography
   */
  private extractTailwindTypography(className: string, properties: CodeProperties): void {
    const fontSizeMap: Record<string, number> = {
      'text-xs': 12,
      'text-sm': 14,
      'text-base': 16,
      'text-lg': 18,
      'text-xl': 20,
      'text-2xl': 24,
      'text-3xl': 30,
      'text-4xl': 36,
    };

    const fontWeightMap: Record<string, number> = {
      'font-thin': 100,
      'font-extralight': 200,
      'font-light': 300,
      'font-normal': 400,
      'font-medium': 500,
      'font-semibold': 600,
      'font-bold': 700,
      'font-extrabold': 800,
      'font-black': 900,
    };

    if (fontSizeMap[className]) {
      properties.typography!.fontSize = fontSizeMap[className];
    }

    if (fontWeightMap[className]) {
      properties.typography!.fontWeight = fontWeightMap[className];
    }
  }

  /**
   * Extract Tailwind layout
   */
  private extractTailwindLayout(className: string, properties: CodeProperties): void {
    if (className === 'flex') {
      properties.layout!.display = 'flex';
    }
    if (className === 'flex-row') {
      properties.layout!.flexDirection = 'row';
    }
    if (className === 'flex-col') {
      properties.layout!.flexDirection = 'column';
    }
    if (className.startsWith('justify-')) {
      properties.layout!.justifyContent = className.replace('justify-', '');
    }
    if (className.startsWith('items-')) {
      properties.layout!.alignItems = className.replace('items-', '');
    }
  }

  /**
   * Convert Tailwind spacing value to pixels
   */
  private tailwindSpacingToPixels(value: string): number | null {
    const num = parseFloat(value);
    if (isNaN(num)) return null;
    return num * 4; // Tailwind uses 0.25rem scale (1 = 4px)
  }

  /**
   * Convert Tailwind size to value
   */
  private tailwindSizeToValue(value: string): number | string | null {
    if (value === 'full') return '100%';
    if (value === 'auto') return 'auto';
    const num = parseFloat(value);
    if (isNaN(num)) return null;
    return num * 4; // Convert to pixels
  }

  /**
   * Convert CSS size to pixels
   */
  private cssSizeToPixels(value: string): number | null {
    if (value.endsWith('px')) {
      return parseFloat(value);
    }
    if (value.endsWith('rem')) {
      return parseFloat(value) * 16; // Assume 16px base
    }
    const num = parseFloat(value);
    if (!isNaN(num)) {
      return num;
    }
    return null;
  }

  /**
   * Extract imports from AST
   */
  private extractImports(ast: any): string[] {
    const imports: string[] = [];

    traverse(ast, {
      ImportDeclaration: (path: any) => {
        imports.push(path.node.source.value);
      },
    });

    return imports;
  }

  /**
   * Extract exports from AST
   */
  private extractExports(ast: any): string[] {
    const exports: string[] = [];

    traverse(ast, {
      ExportNamedDeclaration: (path: any) => {
        if (path.node.declaration && path.node.declaration.declarations) {
          path.node.declaration.declarations.forEach((decl: any) => {
            if (decl.id && decl.id.name) {
              exports.push(decl.id.name);
            }
          });
        }
      },
      ExportDefaultDeclaration: (path: any) => {
        exports.push('default');
      },
    });

    return exports;
  }

  /**
   * Extract dependencies from imports
   */
  private extractDependencies(imports: string[]): string[] {
    return imports.filter((imp) => !imp.startsWith('.') && !imp.startsWith('@/'));
  }

  /**
   * Find component files in repository
   */
  async findComponentFiles(owner: string, repo: string, path: string = ''): Promise<string[]> {
    const componentFiles: string[] = [];

    try {
      const response = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
      });

      if (Array.isArray(response.data)) {
        for (const item of response.data) {
          if (item.type === 'dir') {
            // Recursively search directories
            const subFiles = await this.findComponentFiles(owner, repo, item.path);
            componentFiles.push(...subFiles);
          } else if (item.type === 'file') {
            // Check if it's a component file
            if (
              item.name.endsWith('.tsx') ||
              item.name.endsWith('.jsx') ||
              (item.name.endsWith('.ts') && !item.name.endsWith('.d.ts')) ||
              item.name.endsWith('.js')
            ) {
              componentFiles.push(item.path);
            }
          }
        }
      }
    } catch (error) {
      logger.error('Error finding component files', { error, owner, repo, path });
    }

    return componentFiles;
  }
}
