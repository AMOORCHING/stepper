/**
 * Zustand Store for Thinking Visualization
 * 
 * Manages nodes, edges, session state, and WebSocket integration
 */

import { create } from 'zustand'
import { updateNodePositions } from '../utils/layoutAlgorithm'

export const useThinkingStore = create((set, get) => ({
  // Session state
  sessionId: null,
  isThinking: false,
  isComplete: false,
  solution: null,
  error: null,

  // Nodes and edges
  nodes: [],
  edges: [],
  rawNodes: [], // Nodes without calculated positions

  // UI state
  selectedNodeId: null,
  focusedNodeId: null,

  /**
   * Set the session ID
   */
  setSessionId: (sessionId) => set({ sessionId }),

  /**
   * Add a new thought node
   * Calculates position using layout algorithm
   */
  addNode: (nodeData) => {
    const state = get()
    
    // Create node with proper structure
    const newNode = {
      id: nodeData.id || `node-${Date.now()}`,
      type: nodeData.type || 'Analysis',
      confidence: nodeData.confidence || 0.5,
      content: nodeData.content || '',
      keywords: nodeData.keywords || [],
      dependencies: nodeData.dependencies || [],
      timestamp: nodeData.timestamp || new Date().toISOString()
    }

    const newRawNodes = [...state.rawNodes, newNode]
    
    // Build edges from dependencies
    const newEdges = buildEdgesFromNodes(newRawNodes)
    
    // Calculate positions for all nodes
    const nodesWithPositions = updateNodePositions(newRawNodes, newEdges)

    set({
      rawNodes: newRawNodes,
      nodes: nodesWithPositions,
      edges: newEdges,
      focusedNodeId: newNode.id // Focus on newest node
    })

    return newNode
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

