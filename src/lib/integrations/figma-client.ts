/**
 * Figma API Client for Design-Code Drift Detection
 *
 * Provides methods to:
 * - Fetch Figma file data
 * - Get file versions
 * - Extract component/frame properties
 * - Compare design changes
 */

import { logger } from '@/lib/logger';

const FIGMA_API_BASE = 'https://api.figma.com/v1';

export interface FigmaFile {
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  version: string;
  document: FigmaNode;
  components: Record<string, FigmaComponent>;
  styles: Record<string, FigmaStyle>;
}

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  // Visual properties
  backgroundColor?: RGBA;
  fills?: Paint[];
  strokes?: Paint[];
  strokeWeight?: number;
  cornerRadius?: number;
  // Layout
  layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL';
  primaryAxisSizingMode?: 'FIXED' | 'AUTO';
  counterAxisSizingMode?: 'FIXED' | 'AUTO';
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
  // Typography
  style?: TypeStyle;
  characters?: string;
  // Other
  absoluteBoundingBox?: Rect;
  [key: string]: any;
}

export interface FigmaComponent {
  key: string;
  name: string;
  description: string;
  documentationLinks: any[];
}

export interface FigmaStyle {
  key: string;
  name: string;
  styleType: 'FILL' | 'TEXT' | 'EFFECT' | 'GRID';
  description: string;
}

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface Paint {
  type: 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'IMAGE';
  color?: RGBA;
  opacity?: number;
}

export interface TypeStyle {
  fontFamily: string;
  fontPostScriptName: string;
  fontWeight: number;
  fontSize: number;
  textAlignHorizontal: string;
  textAlignVertical: string;
  letterSpacing: number;
  lineHeightPx: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FigmaVersion {
  id: string;
  created_at: string;
  label: string;
  description: string;
  user: {
    id: string;
    handle: string;
    img_url: string;
  };
}

export interface FigmaFileComparison {
  fileId: string;
  fileName: string;
  changes: DesignChange[];
  addedComponents: string[];
  removedComponents: string[];
  modifiedComponents: string[];
}

export interface DesignChange {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  changeType: 'added' | 'removed' | 'modified';
  property: string;
  oldValue?: any;
  newValue?: any;
  severity: 'low' | 'medium' | 'high';
}

export class FigmaClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Fetch a Figma file
   */
  async getFile(fileId: string): Promise<FigmaFile> {
    try {
      const response = await fetch(`${FIGMA_API_BASE}/files/${fileId}`, {
        headers: {
          'X-Figma-Token': this.accessToken,
        },
      });

      if (!response.ok) {
        throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      logger.error('Failed to fetch Figma file', { fileId, error });
      throw error;
    }
  }

  /**
   * Get file versions (version history)
   */
  async getFileVersions(fileId: string): Promise<FigmaVersion[]> {
    try {
      const response = await fetch(`${FIGMA_API_BASE}/files/${fileId}/versions`, {
        headers: {
          'X-Figma-Token': this.accessToken,
        },
      });

      if (!response.ok) {
        throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.versions || [];
    } catch (error) {
      logger.error('Failed to fetch Figma file versions', { fileId, error });
      throw error;
    }
  }

  /**
   * Get specific file version
   */
  async getFileVersion(fileId: string, versionId: string): Promise<FigmaFile> {
    try {
      const response = await fetch(`${FIGMA_API_BASE}/files/${fileId}?version=${versionId}`, {
        headers: {
          'X-Figma-Token': this.accessToken,
        },
      });

      if (!response.ok) {
        throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      logger.error('Failed to fetch Figma file version', { fileId, versionId, error });
      throw error;
    }
  }

  /**
   * Get specific nodes from a file
   */
  async getFileNodes(fileId: string, nodeIds: string[]): Promise<Record<string, FigmaNode>> {
    try {
      const idsParam = nodeIds.join(',');
      const response = await fetch(`${FIGMA_API_BASE}/files/${fileId}/nodes?ids=${idsParam}`, {
        headers: {
          'X-Figma-Token': this.accessToken,
        },
      });

      if (!response.ok) {
        throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.nodes || {};
    } catch (error) {
      logger.error('Failed to fetch Figma file nodes', { fileId, nodeIds, error });
      throw error;
    }
  }

  /**
   * Get file styles
   */
  async getFileStyles(fileId: string): Promise<Record<string, FigmaStyle>> {
    try {
      const response = await fetch(`${FIGMA_API_BASE}/files/${fileId}/styles`, {
        headers: {
          'X-Figma-Token': this.accessToken,
        },
      });

      if (!response.ok) {
        throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.meta?.styles || {};
    } catch (error) {
      logger.error('Failed to fetch Figma file styles', { fileId, error });
      throw error;
    }
  }

  /**
   * Get image/thumbnail URL for a node
   */
  async getImage(fileId: string, nodeIds: string[], scale: number = 2): Promise<Record<string, string>> {
    try {
      const idsParam = nodeIds.join(',');
      const response = await fetch(
        `${FIGMA_API_BASE}/images/${fileId}?ids=${idsParam}&scale=${scale}&format=png`,
        {
          headers: {
            'X-Figma-Token': this.accessToken,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.images || {};
    } catch (error) {
      logger.error('Failed to fetch Figma images', { fileId, nodeIds, error });
      throw error;
    }
  }

  /**
   * Extract components from a file
   */
  extractComponents(file: FigmaFile): FigmaNode[] {
    const components: FigmaNode[] = [];

    const traverse = (node: FigmaNode) => {
      if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
        components.push(node);
      }
      if (node.children) {
        node.children.forEach(traverse);
      }
    };

    traverse(file.document);
    return components;
  }

  /**
   * Extract design properties from a node
   */
  extractDesignProperties(node: FigmaNode): Record<string, any> {
    const props: Record<string, any> = {};

    // Colors
    if (node.fills && Array.isArray(node.fills)) {
      props.fills = node.fills.map((fill) => ({
        type: fill.type,
        color: fill.color ? this.rgbaToHex(fill.color) : null,
        opacity: fill.opacity || 1,
      }));
    }

    if (node.backgroundColor) {
      props.backgroundColor = this.rgbaToHex(node.backgroundColor);
    }

    // Strokes
    if (node.strokes) {
      props.strokes = node.strokes;
      props.strokeWeight = node.strokeWeight;
    }

    // Borders
    if (node.cornerRadius !== undefined) {
      props.cornerRadius = node.cornerRadius;
    }

    // Layout (Auto-layout)
    if (node.layoutMode) {
      props.layout = {
        mode: node.layoutMode,
        primarySizing: node.primaryAxisSizingMode,
        counterSizing: node.counterAxisSizingMode,
        padding: {
          left: node.paddingLeft || 0,
          right: node.paddingRight || 0,
          top: node.paddingTop || 0,
          bottom: node.paddingBottom || 0,
        },
        itemSpacing: node.itemSpacing || 0,
      };
    }

    // Typography
    if (node.style) {
      props.typography = {
        fontFamily: node.style.fontFamily,
        fontSize: node.style.fontSize,
        fontWeight: node.style.fontWeight,
        lineHeight: node.style.lineHeightPx,
        letterSpacing: node.style.letterSpacing,
        textAlign: node.style.textAlignHorizontal,
      };
    }

    // Size
    if (node.absoluteBoundingBox) {
      props.size = {
        width: node.absoluteBoundingBox.width,
        height: node.absoluteBoundingBox.height,
      };
    }

    return props;
  }

  /**
   * Compare two Figma files/versions and detect changes
   */
  compareFiles(oldFile: FigmaFile, newFile: FigmaFile): FigmaFileComparison {
    const changes: DesignChange[] = [];
    const oldComponents = this.extractComponents(oldFile);
    const newComponents = this.extractComponents(newFile);

    const oldComponentsMap = new Map(oldComponents.map((c) => [c.id, c]));
    const newComponentsMap = new Map(newComponents.map((c) => [c.id, c]));

    const addedComponents: string[] = [];
    const removedComponents: string[] = [];
    const modifiedComponents: string[] = [];

    // Find added components
    newComponents.forEach((newComp) => {
      if (!oldComponentsMap.has(newComp.id)) {
        addedComponents.push(newComp.id);
        changes.push({
          nodeId: newComp.id,
          nodeName: newComp.name,
          nodeType: newComp.type,
          changeType: 'added',
          property: 'component',
          newValue: newComp.name,
          severity: 'medium',
        });
      }
    });

    // Find removed components
    oldComponents.forEach((oldComp) => {
      if (!newComponentsMap.has(oldComp.id)) {
        removedComponents.push(oldComp.id);
        changes.push({
          nodeId: oldComp.id,
          nodeName: oldComp.name,
          nodeType: oldComp.type,
          changeType: 'removed',
          property: 'component',
          oldValue: oldComp.name,
          severity: 'high',
        });
      }
    });

    // Find modified components
    oldComponents.forEach((oldComp) => {
      const newComp = newComponentsMap.get(oldComp.id);
      if (newComp) {
        const componentChanges = this.compareNodes(oldComp, newComp);
        if (componentChanges.length > 0) {
          modifiedComponents.push(oldComp.id);
          changes.push(...componentChanges);
        }
      }
    });

    return {
      fileId: newFile.name,
      fileName: newFile.name,
      changes,
      addedComponents,
      removedComponents,
      modifiedComponents,
    };
  }

  /**
   * Compare two nodes and find property changes
   */
  private compareNodes(oldNode: FigmaNode, newNode: FigmaNode): DesignChange[] {
    const changes: DesignChange[] = [];
    const oldProps = this.extractDesignProperties(oldNode);
    const newProps = this.extractDesignProperties(newNode);

    // Compare fills (colors)
    if (JSON.stringify(oldProps.fills) !== JSON.stringify(newProps.fills)) {
      changes.push({
        nodeId: newNode.id,
        nodeName: newNode.name,
        nodeType: newNode.type,
        changeType: 'modified',
        property: 'fills',
        oldValue: oldProps.fills,
        newValue: newProps.fills,
        severity: 'medium',
      });
    }

    // Compare layout
    if (JSON.stringify(oldProps.layout) !== JSON.stringify(newProps.layout)) {
      changes.push({
        nodeId: newNode.id,
        nodeName: newNode.name,
        nodeType: newNode.type,
        changeType: 'modified',
        property: 'layout',
        oldValue: oldProps.layout,
        newValue: newProps.layout,
        severity: 'medium',
      });
    }

    // Compare typography
    if (JSON.stringify(oldProps.typography) !== JSON.stringify(newProps.typography)) {
      changes.push({
        nodeId: newNode.id,
        nodeName: newNode.name,
        nodeType: newNode.type,
        changeType: 'modified',
        property: 'typography',
        oldValue: oldProps.typography,
        newValue: newProps.typography,
        severity: 'medium',
      });
    }

    // Compare size
    if (JSON.stringify(oldProps.size) !== JSON.stringify(newProps.size)) {
      changes.push({
        nodeId: newNode.id,
        nodeName: newNode.name,
        nodeType: newNode.type,
        changeType: 'modified',
        property: 'size',
        oldValue: oldProps.size,
        newValue: newProps.size,
        severity: 'low',
      });
    }

    return changes;
  }

  /**
   * Convert RGBA to hex color
   */
  private rgbaToHex(rgba: RGBA): string {
    const r = Math.round(rgba.r * 255);
    const g = Math.round(rgba.g * 255);
    const b = Math.round(rgba.b * 255);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
}

/**
 * Create a Figma client from an integration
 */
export async function createFigmaClientFromIntegration(
  prisma: any,
  organizationId: string
): Promise<FigmaClient | null> {
  const integration = await prisma.integration.findUnique({
    where: {
      organizationId_integrationType: {
        organizationId,
        integrationType: 'figma',
      },
    },
  });

  if (!integration || !integration.encryptedAccessToken) {
    return null;
  }

  // Decrypt access token (you'll need to implement decryption)
  const accessToken = integration.encryptedAccessToken; // TODO: Decrypt

  return new FigmaClient(accessToken);
}
