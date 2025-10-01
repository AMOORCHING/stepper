/**
 * Color constants for different ThoughtNode types
 * 
 * Each thought type has a distinct color for visual identification
 * in the 3D visualization. Colors are used for both node materials
 * and UI badges.
 */

export const NODE_COLORS = {
  Analysis: '#4ECDC4',      // Cyan - analytical thinking
  Decision: '#FF6B6B',      // Red - decision points
  Verification: '#95E1D3',  // Light teal - verification steps
  Alternative: '#FFE66D',   // Yellow - alternative approaches
  Implementation: '#A8E6CF' // Light green - implementation details
}

/**
 * Edge/connection colors based on relationship type
 */
export const EDGE_COLORS = {
  logical: {
    color: '#FFFFFF',       // White for logical dependencies
    opacity: 0.6
  },
  temporal: {
    color: '#4A90E2',       // Blue for temporal relationships
    opacity: 0.4
  },
  alternative: {
    color: '#FFE66D',       // Yellow for alternative paths
    opacity: 0.3
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

