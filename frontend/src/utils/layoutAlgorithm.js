/**
 * Layout Algorithm for 3D Hierarchical Node Positioning
 * 
 * This module calculates optimal 3D positions for thought nodes based on
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
 * Calculate 3D position for a node based on layout parameters
 * 
 * @param {object} layout - Layout info {depth, breadthIndex, breadthCount}
 * @param {number} seed - Random seed for Z variation (optional)
 * @returns {object} Position {x, y, z}
 */
function calculatePosition(layout, seed = Math.random()) {
  const { depth, breadthIndex, breadthCount } = layout
  
  // Y position: vertical layers with 5 unit spacing
  // Negative Y so tree grows downward
  const y = -depth * 5
  
  // X position: horizontal spread with 3 unit spacing
  // Centered around x=0
  const x = (breadthIndex - breadthCount / 2) * 3
  
  // Z position: random variation for depth perception
  // Range: -2 to +2
  const z = (seed * 4) - 2
  
  return { x, y, z }
}

/**
 * Main layout calculation function
 * Computes hierarchical 3D positions for all nodes
 * 
 * @param {Array} nodes - Array of node objects with 'id' property
 * @param {Array} edges - Array of edge objects with 'from' and 'to' properties
 * @returns {Map} Map of nodeId -> {x, y, z} position
 */
export function calculateHierarchicalLayout(nodes, edges) {
  if (!nodes || nodes.length === 0) {
    return new Map()
  }
  
  // Step 1: Calculate depth for each node
  const depthMap = calculateDepth(nodes, edges)
  
  // Step 2: Calculate breadth indices
  const layoutMap = calculateBreadth(nodes, depthMap)
  
  // Step 3: Calculate 3D positions
  const positionMap = new Map()
  nodes.forEach((node, index) => {
    const layout = layoutMap.get(node.id)
    if (layout) {
      // Use index as seed for consistent random Z values
      const seed = (index * 0.618033988749895) % 1 // Golden ratio for distribution
      const position = calculatePosition(layout, seed)
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
 * @returns {Array} New array of nodes with position property {x, y, z}
 */
export function updateNodePositions(nodes, edges) {
  const positionMap = calculateHierarchicalLayout(nodes, edges)
  
  return nodes.map(node => ({
    ...node,
    position: positionMap.get(node.id) || { x: 0, y: 0, z: 0 }
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

