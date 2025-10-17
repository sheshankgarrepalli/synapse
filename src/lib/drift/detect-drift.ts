/**
 * Design-Code Drift Detection Algorithm
 *
 * This is the CORE of Synapse's unique value proposition:
 * Automatically detect when Figma designs drift from GitHub code implementation
 */

import { type PrismaClient } from '@prisma/client';
import { FigmaClient, type FigmaNode } from '@/lib/integrations/figma-client';
import { logger } from '@/lib/logger';
import fs from 'fs';
import path from 'path';

export interface DriftDetectionResult {
  hasDrift: boolean;
  driftType: 'design_updated' | 'code_updated' | 'both_changed' | 'in_sync';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  changes: PropertyDrift[];
  summary: string;
  impact: string;
  recommendation: string;
}

export interface PropertyDrift {
  property: string; // "color", "spacing", "typography", "size"
  designValue: any;
  codeValue: any;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface DesignSnapshot {
  fileId: string;
  fileName: string;
  nodeId: string;
  nodeName: string;
  properties: Record<string, any>;
  capturedAt: Date;
}

export interface CodeSnapshot {
  filePath: string;
  componentName: string;
  properties: Record<string, any>;
  commitSha: string;
  capturedAt: Date;
}

/**
 * Main drift detection function
 * Compares a design snapshot (Figma) with code snapshot (GitHub)
 */
export async function detectDrift(
  designSnapshot: DesignSnapshot,
  codeSnapshot: CodeSnapshot
): Promise<DriftDetectionResult> {
  const changes: PropertyDrift[] = [];

  // Compare colors
  const colorDrifts = compareColors(designSnapshot.properties, codeSnapshot.properties);
  changes.push(...colorDrifts);

  // Compare spacing
  const spacingDrifts = compareSpacing(designSnapshot.properties, codeSnapshot.properties);
  changes.push(...spacingDrifts);

  // Compare typography
  const typographyDrifts = compareTypography(designSnapshot.properties, codeSnapshot.properties);
  changes.push(...typographyDrifts);

  // Compare sizes
  const sizeDrifts = compareSizes(designSnapshot.properties, codeSnapshot.properties);
  changes.push(...sizeDrifts);

  // Calculate overall drift metrics
  const hasDrift = changes.length > 0;
  const severity = calculateSeverity(changes);
  const confidence = calculateConfidence(changes, designSnapshot, codeSnapshot);
  const driftType = determineDriftType(designSnapshot, codeSnapshot);

  // Generate AI summary
  const summary = generateSummary(changes, designSnapshot, codeSnapshot);
  const impact = generateImpact(changes, designSnapshot, codeSnapshot);
  const recommendation = generateRecommendation(changes, designSnapshot, codeSnapshot);

  return {
    hasDrift,
    driftType,
    severity,
    confidence,
    changes,
    summary,
    impact,
    recommendation,
  };
}

/**
 * Compare color properties
 */
function compareColors(designProps: Record<string, any>, codeProps: Record<string, any>): PropertyDrift[] {
  const drifts: PropertyDrift[] = [];

  // Compare background colors
  const designBg = designProps.backgroundColor;
  const codeBg = codeProps.backgroundColor;

  if (designBg && codeBg && !colorsMatch(designBg, codeBg)) {
    drifts.push({
      property: 'backgroundColor',
      designValue: designBg,
      codeValue: codeBg,
      severity: 'medium',
      description: `Background color changed from ${codeBg} (code) to ${designBg} (design)`,
    });
  }

  // Compare fills
  if (designProps.fills && codeProps.fills) {
    const designFills = designProps.fills;
    const codeFills = codeProps.fills;

    if (JSON.stringify(designFills) !== JSON.stringify(codeFills)) {
      drifts.push({
        property: 'fills',
        designValue: designFills,
        codeValue: codeFills,
        severity: 'medium',
        description: 'Fill colors have changed between design and code',
      });
    }
  }

  return drifts;
}

/**
 * Compare spacing/layout properties
 */
function compareSpacing(designProps: Record<string, any>, codeProps: Record<string, any>): PropertyDrift[] {
  const drifts: PropertyDrift[] = [];

  const designLayout = designProps.layout;
  const codeLayout = codeProps.layout;

  if (designLayout && codeLayout) {
    // Compare padding
    if (JSON.stringify(designLayout.padding) !== JSON.stringify(codeLayout.padding)) {
      drifts.push({
        property: 'padding',
        designValue: designLayout.padding,
        codeValue: codeLayout.padding,
        severity: 'low',
        description: 'Padding values differ between design and code',
      });
    }

    // Compare item spacing (gap)
    if (designLayout.itemSpacing !== codeLayout.itemSpacing) {
      drifts.push({
        property: 'itemSpacing',
        designValue: designLayout.itemSpacing,
        codeValue: codeLayout.itemSpacing,
        severity: 'low',
        description: `Gap/spacing changed from ${codeLayout.itemSpacing}px (code) to ${designLayout.itemSpacing}px (design)`,
      });
    }

    // Compare layout mode
    if (designLayout.mode !== codeLayout.mode) {
      drifts.push({
        property: 'layoutMode',
        designValue: designLayout.mode,
        codeValue: codeLayout.mode,
        severity: 'high',
        description: `Layout direction changed from ${codeLayout.mode} (code) to ${designLayout.mode} (design)`,
      });
    }
  }

  return drifts;
}

/**
 * Compare typography properties
 */
function compareTypography(designProps: Record<string, any>, codeProps: Record<string, any>): PropertyDrift[] {
  const drifts: PropertyDrift[] = [];

  const designTypo = designProps.typography;
  const codeTypo = codeProps.typography;

  if (designTypo && codeTypo) {
    // Font family
    if (designTypo.fontFamily !== codeTypo.fontFamily) {
      drifts.push({
        property: 'fontFamily',
        designValue: designTypo.fontFamily,
        codeValue: codeTypo.fontFamily,
        severity: 'medium',
        description: `Font changed from "${codeTypo.fontFamily}" (code) to "${designTypo.fontFamily}" (design)`,
      });
    }

    // Font size
    if (designTypo.fontSize !== codeTypo.fontSize) {
      drifts.push({
        property: 'fontSize',
        designValue: designTypo.fontSize,
        codeValue: codeTypo.fontSize,
        severity: 'medium',
        description: `Font size changed from ${codeTypo.fontSize}px (code) to ${designTypo.fontSize}px (design)`,
      });
    }

    // Font weight
    if (designTypo.fontWeight !== codeTypo.fontWeight) {
      drifts.push({
        property: 'fontWeight',
        designValue: designTypo.fontWeight,
        codeValue: codeTypo.fontWeight,
        severity: 'low',
        description: `Font weight changed from ${codeTypo.fontWeight} (code) to ${designTypo.fontWeight} (design)`,
      });
    }

    // Line height
    if (designTypo.lineHeight !== codeTypo.lineHeight) {
      drifts.push({
        property: 'lineHeight',
        designValue: designTypo.lineHeight,
        codeValue: codeTypo.lineHeight,
        severity: 'low',
        description: `Line height changed from ${codeTypo.lineHeight}px (code) to ${designTypo.lineHeight}px (design)`,
      });
    }
  }

  return drifts;
}

/**
 * Compare size properties
 */
function compareSizes(designProps: Record<string, any>, codeProps: Record<string, any>): PropertyDrift[] {
  const drifts: PropertyDrift[] = [];

  const designSize = designProps.size;
  const codeSize = codeProps.size;

  if (designSize && codeSize) {
    // Width
    if (Math.abs(designSize.width - codeSize.width) > 2) {
      // 2px tolerance
      drifts.push({
        property: 'width',
        designValue: designSize.width,
        codeValue: codeSize.width,
        severity: 'low',
        description: `Width changed from ${codeSize.width}px (code) to ${designSize.width}px (design)`,
      });
    }

    // Height
    if (Math.abs(designSize.height - codeSize.height) > 2) {
      // 2px tolerance
      drifts.push({
        property: 'height',
        designValue: designSize.height,
        codeValue: codeSize.height,
        severity: 'low',
        description: `Height changed from ${codeSize.height}px (code) to ${designSize.height}px (design)`,
      });
    }
  }

  return drifts;
}

/**
 * Check if two colors match (handles hex, rgb variations)
 */
function colorsMatch(color1: string, color2: string): boolean {
  // Normalize colors to hex
  const hex1 = normalizeColorToHex(color1);
  const hex2 = normalizeColorToHex(color2);
  return hex1 === hex2;
}

function normalizeColorToHex(color: string): string {
  // Simple normalization - you can expand this
  if (color.startsWith('#')) {
    return color.toLowerCase();
  }
  // Handle rgb(255, 255, 255) -> #ffffff
  // TODO: Implement RGB to hex conversion
  return color;
}

/**
 * Calculate overall severity based on all changes
 */
function calculateSeverity(changes: PropertyDrift[]): 'low' | 'medium' | 'high' | 'critical' {
  if (changes.length === 0) return 'low';

  const severityCounts = {
    low: 0,
    medium: 0,
    high: 0,
  };

  changes.forEach((change) => {
    severityCounts[change.severity]++;
  });

  // Critical: 3+ high severity changes
  if (severityCounts.high >= 3) return 'critical';

  // High: Any high severity change or 5+ medium changes
  if (severityCounts.high > 0 || severityCounts.medium >= 5) return 'high';

  // Medium: 2+ medium severity changes
  if (severityCounts.medium >= 2) return 'medium';

  // Low: everything else
  return 'low';
}

/**
 * Calculate confidence score (0.0 - 1.0)
 */
function calculateConfidence(
  changes: PropertyDrift[],
  designSnapshot: DesignSnapshot,
  codeSnapshot: CodeSnapshot
): number {
  let confidence = 0.5; // Base confidence

  // Higher confidence if we have many specific changes
  if (changes.length > 0) {
    confidence += 0.2;
  }

  // Higher confidence if component names match
  if (
    designSnapshot.nodeName.toLowerCase().includes(codeSnapshot.componentName.toLowerCase()) ||
    codeSnapshot.componentName.toLowerCase().includes(designSnapshot.nodeName.toLowerCase())
  ) {
    confidence += 0.2;
  }

  // Higher confidence if recent snapshots (less than 7 days old)
  const daysSinceDesign = (Date.now() - designSnapshot.capturedAt.getTime()) / (1000 * 60 * 60 * 24);
  const daysSinceCode = (Date.now() - codeSnapshot.capturedAt.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceDesign < 7 && daysSinceCode < 7) {
    confidence += 0.1;
  }

  return Math.min(confidence, 1.0);
}

/**
 * Determine drift type
 */
function determineDriftType(
  designSnapshot: DesignSnapshot,
  codeSnapshot: CodeSnapshot
): 'design_updated' | 'code_updated' | 'both_changed' | 'in_sync' {
  const designNewer = designSnapshot.capturedAt > codeSnapshot.capturedAt;
  const codeNewer = codeSnapshot.capturedAt > designSnapshot.capturedAt;

  if (Math.abs(designSnapshot.capturedAt.getTime() - codeSnapshot.capturedAt.getTime()) < 60000) {
    // Within 1 minute
    return 'both_changed';
  }

  if (designNewer) {
    return 'design_updated';
  }

  if (codeNewer) {
    return 'code_updated';
  }

  return 'in_sync';
}

/**
 * Generate human-readable summary using Claude Code's intelligence
 */
function generateSummary(
  changes: PropertyDrift[],
  designSnapshot: DesignSnapshot,
  codeSnapshot: CodeSnapshot
): string {
  if (changes.length === 0) {
    return `${designSnapshot.nodeName} design and code are in sync`;
  }

  const changeDescriptions = changes.slice(0, 3).map((c) => c.description);

  if (changes.length === 1) {
    return changeDescriptions[0];
  }

  if (changes.length === 2) {
    return `${changeDescriptions[0]} and ${changeDescriptions[1]}`;
  }

  return `${changeDescriptions[0]}, ${changeDescriptions[1]}, and ${changes.length - 2} more change(s)`;
}

/**
 * Generate impact description
 */
function generateImpact(
  changes: PropertyDrift[],
  designSnapshot: DesignSnapshot,
  codeSnapshot: CodeSnapshot
): string {
  const highSeverityCount = changes.filter((c) => c.severity === 'high').length;
  const mediumSeverityCount = changes.filter((c) => c.severity === 'medium').length;

  if (highSeverityCount > 0) {
    return `High impact: ${highSeverityCount} critical design change(s) affect the implementation of ${codeSnapshot.componentName}`;
  }

  if (mediumSeverityCount >= 3) {
    return `Medium impact: ${mediumSeverityCount} design changes affect ${codeSnapshot.componentName}`;
  }

  return `Low impact: Minor design tweaks to ${codeSnapshot.componentName}`;
}

/**
 * Generate actionable recommendation
 */
function generateRecommendation(
  changes: PropertyDrift[],
  designSnapshot: DesignSnapshot,
  codeSnapshot: CodeSnapshot
): string {
  if (changes.length === 0) {
    return 'No action needed - design and code are in sync';
  }

  const changeTypes = new Set(changes.map((c) => c.property));

  const updates: string[] = [];

  if (changeTypes.has('backgroundColor') || changeTypes.has('fills')) {
    updates.push('Update color values');
  }

  if (changeTypes.has('padding') || changeTypes.has('itemSpacing') || changeTypes.has('layoutMode')) {
    updates.push('Adjust spacing and layout');
  }

  if (changeTypes.has('fontSize') || changeTypes.has('fontFamily') || changeTypes.has('fontWeight')) {
    updates.push('Update typography');
  }

  if (updates.length === 0) {
    return `Review and update ${codeSnapshot.filePath} to match latest Figma design`;
  }

  return `Update ${codeSnapshot.filePath}: ${updates.join(', ')}`;
}

/**
 * Queue drift analysis request for Claude Code
 * Similar to relationship detection, but for design-code drift
 */
export async function queueDriftAnalysis(
  designItemId: string,
  codeItemId: string,
  organizationId: string
): Promise<string> {
  const requestId = `drift-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  const QUEUE_DIR = path.join(process.cwd(), '.claude-analysis', 'queue');
  const PROMPTS_DIR = path.join(process.cwd(), '.claude-analysis', 'prompts');

  // Ensure directories exist
  if (!fs.existsSync(QUEUE_DIR)) {
    fs.mkdirSync(QUEUE_DIR, { recursive: true });
  }
  if (!fs.existsSync(PROMPTS_DIR)) {
    fs.mkdirSync(PROMPTS_DIR, { recursive: true });
  }

  // Create queue request
  const queueRequest = {
    id: requestId,
    type: 'drift_detection',
    organizationId,
    timestamp: new Date().toISOString(),
    data: {
      designItemId,
      codeItemId,
    },
    status: 'pending',
  };

  fs.writeFileSync(path.join(QUEUE_DIR, `${requestId}.json`), JSON.stringify(queueRequest, null, 2));

  logger.info('Drift analysis queued for Claude Code', { requestId, designItemId, codeItemId });

  return requestId;
}
