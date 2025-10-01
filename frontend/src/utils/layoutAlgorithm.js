/**
 * Layout Algorithm for 2D Hierarchical Node Positioning
 * 
 * This module calculates optimal 2D positions for thought nodes based on
 * their dependency relationships, creating a hierarchical tree-like structure.
 */

/**
 * Calculate the depth level for each node based on dependencies
 * Depth = longest path from root nodes (nodes with no dependencies)
 * 
 * @param {Array} nodes - Array of node objects
 * @param {Array} edges - Array of edge objects with 'from' and 'to' properties
 * @returns {Map} Map of nodeId -> depth level
 */
function calculateDepth(nodes, edges) {
  const depthMap = new Map()
  const visited = new Set()
  
  // Build adjacency list for dependencies
  const dependencies = new Map()
  nodes.forEach(node => {
    dependencies.set(node.id, [])
  })
  
  edges.forEach(edge => {
    if (dependencies.has(edge.to)) {
      dependencies.get(edge.to).push(edge.from)
    }
  })
  
  // Find root nodes (no dependencies)
  const roots = nodes.filter(node => 
    dependencies.get(node.id).length === 0
  )
  
  // DFS to calculate depth
  function calculateNodeDepth(nodeId) {
    if (visited.has(nodeId)) {
      return depthMap.get(nodeId)
    }
    
    visited.add(nodeId)
    const deps = dependencies.get(nodeId) || []
    
    if (deps.length === 0) {
      depthMap.set(nodeId, 0)
      return 0
    }
    
    const maxDepth = Math.max(...deps.map(depId => calculateNodeDepth(depId)))
    const depth = maxDepth + 1
    depthMap.set(nodeId, depth)
    return depth
  }
  
  // Calculate depth for all nodes
  nodes.forEach(node => calculateNodeDepth(node.id))
  
  return depthMap
}

/**
 * Group nodes by depth level and calculate breadth indices
 * 
 * @param {Array} nodes - Array of node objects
 * @param {Map} depthMap - Map of nodeId -> depth
 * @returns {Map} Map of nodeId -> {depth, breadthIndex, breadthCount}
 */
function calculateBreadth(nodes, depthMap) {
  const layoutMap = new Map()
  
  // Group nodes by depth
  const depthGroups = new Map()
  nodes.forEach(node => {
    const depth = depthMap.get(node.id) || 0
    if (!depthGroups.has(depth)) {
      depthGroups.set(depth, [])
    }
    depthGroups.get(depth).push(node.id)
  })
  
  // Calculate breadth index for each node
  depthGroups.forEach((nodeIds, depth) => {
    const breadthCount = nodeIds.length
    nodeIds.forEach((nodeId, index) => {
      layoutMap.set(nodeId, {
        depth,
        breadthIndex: index,
        breadthCount
      })
    })
  })
  
  return layoutMap
}

/**
 * Calculate 2D position for a node based on layout parameters
 * 
 * @param {object} layout - Layout info {depth, breadthIndex, breadthCount}
 * @returns {object} Position {x, y}
 */
function calculatePosition(layout) {
  const { depth, breadthIndex, breadthCount } = layout
  
  // Ensure all values are valid numbers
  const safeDepth = Number.isFinite(depth) ? depth : 0
  const safeBreadthIndex = Number.isFinite(breadthIndex) ? breadthIndex : 0
  const safeBreadthCount = Number.isFinite(breadthCount) && breadthCount > 0 ? breadthCount : 1
  
  // Y position: vertical layers with 200 pixel spacing (increased for better visibility)
  // Start at 100 so first layer is visible
  const y = safeDepth * 200 + 100
  
  // X position: horizontal spread with 250 pixel spacing (increased for better visibility)
  // Centered around x=1000 (middle of 2000-wide viewBox)
  const x = 1000 + (safeBreadthIndex - (safeBreadthCount - 1) / 2) * 250
  
  return { x, y }
}

/**
 * Main layout calculation function
 * Computes hierarchical 2D positions for all nodes
 * 
 * @param {Array} nodes - Array of node objects with 'id' property
 * @param {Array} edges - Array of edge objects with 'from' and 'to' properties
 * @returns {Map} Map of nodeId -> {x, y} position
 */
export function calculateHierarchicalLayout(nodes, edges) {
  if (!nodes || nodes.length === 0) {
    return new Map()
  }
  
  // Step 1: Calculate depth for each node
  const depthMap = calculateDepth(nodes, edges)
  
  // Step 2: Calculate breadth indices
  const layoutMap = calculateBreadth(nodes, depthMap)
  
  // Step 3: Calculate 2D positions
  const positionMap = new Map()
  nodes.forEach((node) => {
    const layout = layoutMap.get(node.id)
    if (layout) {
      const position = calculatePosition(layout)
      positionMap.set(node.id, position)
    }
  })
  
  return positionMap
}

/**
 * Update nodes array with calculated positions
 * Returns a new array with position property added to each node
 * 
 * @param {Array} nodes - Array of node objects
 * @param {Array} edges - Array of edge objects
 * @returns {Array} New array of nodes with position property {x, y}
 */
export function updateNodePositions(nodes, edges) {
  const positionMap = calculateHierarchicalLayout(nodes, edges)
  
  return nodes.map(node => ({
    ...node,
    position: positionMap.get(node.id) || { x: 0, y: 0 }
  }))
}

/**
 * Recalculate positions when new nodes are added
 * Maintains existing positions for unchanged nodes
 * 
 * @param {Array} existingNodes - Current nodes with positions
 * @param {Array} newNodes - New nodes to be added
 * @param {Array} edges - All edges including new connections
 * @returns {Array} Combined array with updated positions
 */
export function updateLayoutWithNewNodes(existingNodes, newNodes, edges) {
  const allNodes = [...existingNodes, ...newNodes]
  return updateNodePositions(allNodes, edges)
}

