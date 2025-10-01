/**
 * Color constants for different ThoughtNode types
 * Research-grade palette following PRD0 design system
 * 
 * Each thought type has a distinct color for visual identification.
 * Colors meet WCAG AA contrast requirements.
 */

export const NODE_COLORS = {
  Analysis: '#2563EB',      // Blue - analytical thinking
  Decision: '#DC2626',      // Red - decision points
  Verification: '#059669',  // Green - verification steps
  Alternative: '#D97706',   // Orange - alternative approaches
  Implementation: '#7C3AED' // Purple - implementation details
}

/**
 * Edge/connection colors based on relationship type
 * Subtle grays for research-grade aesthetic
 */
export const EDGE_COLORS = {
  logical: {
    color: '#D4D4D4',       // Subtle gray for logical dependencies
    opacity: 0.6
  },
  temporal: {
    color: '#A3A3A3',       // Medium gray for temporal relationships
    opacity: 0.5
  },
  alternative: {
    color: '#D97706',       // Orange for alternative paths
    opacity: 0.4
  }
}

/**
 * Get color for a specific thought type
 * @param {string} type - The thought type
 * @returns {string} Hex color code
 */
export function getNodeColor(type) {
  return NODE_COLORS[type] || NODE_COLORS.Analysis
}

/**
 * Get edge style based on relationship type
 * @param {string} relationshipType - Type of relationship between nodes
 * @returns {object} Color and opacity values
 */
export function getEdgeStyle(relationshipType) {
  return EDGE_COLORS[relationshipType] || EDGE_COLORS.logical
}

