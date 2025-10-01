/**
 * Zustand Store for Thinking Visualization
 * 
 * Manages nodes, edges, session state, and WebSocket integration
 */

import { create } from 'zustand'

export const useThinkingStore = create((set, get) => ({
  nodes: [],
  edges: [],
  rawNodes: [],
  sessionId: null,
  isThinking: false,
  isComplete: false,
  solution: null,
  error: null,
  selectedNodeId: null,
  focusedNodeId: null,
  
  addNode: (nodeData) => {
    try {
      if (!nodeData) {
        console.error('addNode called with null/undefined nodeData')
        return null
      }
      
      const state = get()
      
      // Check if node already exists
      if (state.rawNodes.some(n => n.id === nodeData.id)) {
        console.warn('Node already exists, skipping:', nodeData.id)
        return null
      }
      
      // Create node WITHOUT position (D3-force will calculate)
      const newNode = {
        id: nodeData.id || `node-${Date.now()}`,
        type: nodeData.type || 'Analysis',
        confidence: nodeData.confidence || 0.5,
        content: nodeData.content || '',
        keywords: nodeData.keywords || [],
        dependencies: nodeData.dependencies || [],
        timestamp: nodeData.timestamp || new Date().toISOString()
      }
      
      console.log('Creating node in store:', newNode.id)
  
      const newRawNodes = [...state.rawNodes, newNode]
      
      // Build edges from ALL nodes (including new one)
      const newEdges = buildEdgesFromNodes(newRawNodes)  // ✅ FIX HERE
  
      set({
        rawNodes: newRawNodes,
        nodes: newRawNodes,  // No positions - D3 handles layout
        edges: newEdges,
        focusedNodeId: newNode.id
      })
  
      console.log('Node added successfully. Total nodes:', newRawNodes.length)
      return newNode
    } catch (error) {
      console.error('Error adding node:', error, 'nodeData:', nodeData)
      return null
    }
  },

  /**
   * Update an existing node
   */
  updateNode: (nodeId, updates) => {
    const state = get()
    
    const updatedRawNodes = state.rawNodes.map(node =>
      node.id === nodeId ? { ...node, ...updates } : node
    )

    const newEdges = buildEdgesFromNodes(updatedRawNodes)
    const nodesWithPositions = updateNodePositions(updatedRawNodes, newEdges)

    set({
      rawNodes: updatedRawNodes,
      nodes: nodesWithPositions,
      edges: newEdges
    })
  },

  /**
   * Clear all nodes and edges
   */
  clearNodes: () => set({
    nodes: [],
    edges: [],
    rawNodes: [],
    focusedNodeId: null,
    selectedNodeId: null
  }),

  /**
   * Set thinking state
   */
  setThinking: (isThinking) => set({ isThinking }),

  /**
   * Mark thinking as complete
   */
  setComplete: (isComplete) => set({
    isComplete,
    isThinking: false,
    focusedNodeId: null // Stop auto-focusing
  }),

  /**
   * Set the solution
   */
  setSolution: (solution) => set({ solution }),

  /**
   * Set error state
   */
  setError: (error) => set({
    error,
    isThinking: false
  }),

  /**
   * Clear error
   */
  clearError: () => set({ error: null }),

  /**
   * Select a node
   */
  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

  /**
   * Focus on a node (for camera)
   */
  focusNode: (nodeId) => set({ focusedNodeId: nodeId }),

  /**
   * Reset the entire store
   */
  reset: () => set({
    sessionId: null,
    isThinking: false,
    isComplete: false,
    solution: null,
    error: null,
    nodes: [],
    edges: [],
    rawNodes: [],
    selectedNodeId: null,
    focusedNodeId: null
  })
}))

/**
 * Build edges array from node dependencies
 * Each dependency creates an edge from dependency ID to current node ID
 * 
 * @param {Array} nodes - Array of nodes with dependencies
 * @returns {Array} Array of edge objects
 */
function buildEdgesFromNodes(nodes) {
  const edges = []
  
  nodes.forEach(node => {
    if (node.dependencies && Array.isArray(node.dependencies)) {
      node.dependencies.forEach(depId => {
        // Check if dependency node exists
        const dependencyExists = nodes.some(n => n.id === depId)
        
        if (dependencyExists) {
          edges.push({
            from: depId,
            to: node.id,
            relationshipType: 'logical', // Default to logical
            strength: 0.8 // Default strength
          })
        }
      })
    }
  })
  
  return edges
}

/**
 * Get the newest node (last added)
 */
export const getNewestNode = (state) => {
  const nodes = state.nodes
  return nodes.length > 0 ? nodes[nodes.length - 1] : null
}

/**
 * Get node by ID
 */
export const getNodeById = (state, nodeId) => {
  return state.nodes.find(node => node.id === nodeId)
}

/**
 * Get all nodes of a specific type
 */
export const getNodesByType = (state, type) => {
  return state.nodes.filter(node => node.type === type)
}

