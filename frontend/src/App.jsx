import { useState, useEffect, useRef } from 'react'
import ThinkingScene2D from './components/ThinkingScene2D'
import ThoughtNode2D from './components/ThoughtNode2D'
import ThoughtEdge2D from './components/ThoughtEdge2D'
import NodeDetailPanel from './components/NodeDetailPanel'
import { updateNodePositions } from './utils/layoutAlgorithm'
import { useThinkingStore } from './store/thinkingStore'
import { useWebSocket } from './hooks/useWebSocket'
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'

// Test data: multiple nodes with different types (without manual positions)
const testNodesRaw = [
  {
    id: 'node1',
    type: 'Analysis',
    confidence: 0.8,
    content: 'Initial analysis of the problem'
  },
  {
    id: 'node2',
    type: 'Decision',
    confidence: 0.9,
    content: 'Decision point: choose approach A'
  },
  {
    id: 'node3',
    type: 'Alternative',
    confidence: 0.6,
    content: 'Alternative approach B'
  },
  {
    id: 'node4',
    type: 'Verification',
    confidence: 1.0,
    content: 'Verify solution correctness'
  },
  {
    id: 'node5',
    type: 'Implementation',
    confidence: 0.7,
    content: 'Implement final solution'
  }
]

// Test edges: connections between nodes
const testEdges = [
  { from: 'node1', to: 'node2', relationshipType: 'logical', strength: 0.8 },
  { from: 'node1', to: 'node3', relationshipType: 'alternative', strength: 0.5 },
  { from: 'node2', to: 'node4', relationshipType: 'temporal', strength: 0.7 },
  { from: 'node3', to: 'node4', relationshipType: 'temporal', strength: 0.6 },
  { from: 'node4', to: 'node5', relationshipType: 'logical', strength: 0.9 }
]

// Calculate positions using the layout algorithm
const testNodes = updateNodePositions(testNodesRaw, testEdges)

function TestNodes({ nodes = testNodes, edges = testEdges, onNodeClick, onNodeDoubleClick, onNodeHover }) {
  const handleNodeClick = (node) => {
    if (onNodeClick) onNodeClick(node)
  }
  
  const handleNodeDoubleClick = (node) => {
    if (onNodeDoubleClick) onNodeDoubleClick(node)
  }
  
  const handleNodeHover = (node, isHovering) => {
    if (onNodeHover) onNodeHover(node, isHovering)
  }
  
  // Stagger delay: 100ms between each node
  const STAGGER_DELAY = 100
  
  // Mark the last node as pulsing (most recently added)
  const newestNodeId = nodes[nodes.length - 1]?.id

  return (
    <>
      {/* Render edges first (so they appear behind nodes) */}
      {edges.map((edge, index) => {
        const fromNode = nodes.find(n => n.id === edge.from)
        const toNode = nodes.find(n => n.id === edge.to)
        
        // Only render edge if both nodes are visible
        if (!fromNode || !toNode) return null
        
        // Calculate delay: edges appear after their connected nodes
        const fromIndex = nodes.findIndex(n => n.id === edge.from)
        const toIndex = nodes.findIndex(n => n.id === edge.to)
        const maxIndex = Math.max(fromIndex, toIndex)
        const edgeDelay = (maxIndex + 1) * STAGGER_DELAY + 400 // Extra 400ms after node appears
        
        return (
          <ThoughtEdge2D
            key={`edge-${index}`}
            edge={edge}
            fromNode={fromNode}
            toNode={toNode}
            appearDelay={edgeDelay}
          />
        )
      })}
      
      {/* Render nodes with stagger */}
      {nodes.map((node, index) => (
        <ThoughtNode2D
          key={node.id}
          node={node}
          onClick={handleNodeClick}
          onDoubleClick={handleNodeDoubleClick}
          onHover={handleNodeHover}
          appearDelay={index * STAGGER_DELAY}
          isPulsing={node.id === newestNodeId}
        />
      ))}
    </>
  )
}

function App() {
  const [showScene, setShowScene] = useState(false)
  const [nodeCount, setNodeCount] = useState(0)
  const [useWebSocketMode, setUseWebSocketMode] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [selectedNode, setSelectedNode] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const sceneControlsRef = useRef(null)
  
  // Problem submission state
  const [problem, setProblem] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  
  // Zustand store
  const {
    nodes: storeNodes,
    edges: storeEdges,
    isThinking,
    isComplete,
    error,
    addNode,
    setComplete,
    setError,
    clearError,
    reset: resetStore
  } = useThinkingStore()
  
  // WebSocket integration
  const { isConnected, connectionError } = useWebSocket({
    sessionId: useWebSocketMode ? sessionId : null,
    onNewThought: (thought) => {
      console.log('Adding node to store:', thought?.id)
      addNode(thought)
      console.log('Total nodes in store:', storeNodes.length + 1)
    },
    onThinkingComplete: (data) => {
      console.log('Thinking complete:', data)
      setComplete(true)
    },
    onSolutionReady: (solution) => {
      console.log('Solution ready:', solution)
    },
    onError: (err) => {
      console.error('WebSocket error:', err)
      setError(err)
    }
  })
  
  // Get nodes to display
  const nodesToUse = useWebSocketMode ? storeNodes : testNodes.slice(0, nodeCount)
  
  // Simulate nodes appearing over time (for demo mode only)
  useEffect(() => {
    if (useWebSocketMode || !showScene) {
      setNodeCount(0)
      return
    }
    
    const timer = setTimeout(() => {
      if (nodeCount < testNodes.length) {
        setNodeCount(prev => prev + 1)
      }
    }, nodeCount === 0 ? 800 : 900) // First node after 800ms, then 900ms between nodes
    
    return () => clearTimeout(timer)
  }, [showScene, nodeCount, useWebSocketMode])
  
  // Reset store when switching modes
  useEffect(() => {
    if (useWebSocketMode) {
      resetStore()
    }
  }, [useWebSocketMode, resetStore])
  
  // Handle node click - open detail panel
  const handleNodeClick = (node) => {
    if (node) {
      console.log('Node clicked:', node)
      setSelectedNode(node)
    }
  }
  
  // Handle node double-click - focus view
  const handleNodeDoubleClick = (node) => {
    if (node && sceneControlsRef.current?.focusOnNode) {
      console.log('Node double-clicked, focusing view:', node.id)
      sceneControlsRef.current.focusOnNode(node.position)
    }
  }
  
  // Handle node hover
  const handleNodeHover = (node, isHovering) => {
    // console.log('Node hover:', node.id, isHovering)
  }
  
  // Scene ready handler
  const handleSceneReady = (controls) => {
    sceneControlsRef.current = controls
  }
  
  // Loading state management
  useEffect(() => {
    if (showScene) {
      setIsLoading(true)
      const timer = setTimeout(() => setIsLoading(false), 800)
      return () => clearTimeout(timer)
    }
  }, [showScene])
  
  // Handle problem submission
  const handleSubmitProblem = async (e) => {
    e.preventDefault()
    
    if (!problem.trim() || problem.trim().length < 10) {
      setSubmitError('Problem must be at least 10 characters')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ problem: problem.trim() })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Analysis started:', data)
      
      // Set session and switch to WebSocket mode
      setSessionId(data.session_id)
      setUseWebSocketMode(true)
      setProblem('')
      
      // Show the scene
      setTimeout(() => {
        setShowScene(true)
      }, 100)
      
    } catch (err) {
      console.error('Failed to submit problem:', err)
      setSubmitError(`Failed to start analysis: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Example problems
  const exampleProblems = [
    "Reverse a linked list",
    "Design LRU cache",
    "Longest palindromic substring",
    "Implement merge sort",
  ]

  if (showScene) {
    return (
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar>
            {/* Sidebar content - metrics, controls, etc */}
            <section>
              <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide mb-4">
                Session Info
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-secondary">Nodes</span>
                  <span className="text-sm font-semibold text-text-primary">{nodesToUse.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-secondary">Status</span>
                  <span className="text-sm font-semibold text-text-primary">
                    {isThinking ? 'Thinking...' : isComplete ? 'Complete' : 'Ready'}
                  </span>
                </div>
                {useWebSocketMode && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-secondary">Connection</span>
                    <span className={`text-sm font-semibold ${isConnected ? 'text-accent-success' : 'text-accent-error'}`}>
                      {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                )}
              </div>
            </section>
          </Sidebar>
          <div className="relative flex-1">
        {/* Loading Spinner */}
        {isLoading && (
          <div className="fixed inset-0 flex flex-col items-center justify-center bg-bg-primary z-[10000]" style={{ animation: 'fadeOut 0.5s ease-out 1s forwards' }}>
            <div className="w-[60px] h-[60px] border-4 border-accent-primary/20 border-t-accent-primary rounded-full animate-spin" />
            <p className="mt-5 text-text-secondary">
              Loading Visualization...
            </p>
          </div>
        )}
        
        <ThinkingScene2D 
          onReady={handleSceneReady}
        >
          <TestNodes 
            nodes={nodesToUse} 
            edges={useWebSocketMode ? storeEdges : testEdges}
            onNodeClick={handleNodeClick}
            onNodeDoubleClick={handleNodeDoubleClick}
            onNodeHover={handleNodeHover}
          />
        </ThinkingScene2D>
        
        {/* Node Detail Panel */}
        {selectedNode && (
          <NodeDetailPanel
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            position="right"
          />
        )}
        
        {/* Info overlay */}
        <div className="absolute top-5 left-5 z-10 max-w-[350px]">
          <div className="bg-bg-secondary border border-border-subtle rounded-md p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="text-xl font-semibold mb-4 text-text-primary leading-tight">
              {useWebSocketMode ? '🔗 WebSocket Mode' : '🎬 Demo Mode'}
            </div>
            <div className="text-sm text-text-secondary leading-normal space-y-2">
              {useWebSocketMode ? (
                <>
                  <p>
                    {isConnected ? '✅ Connected' : connectionError ? '❌ Error' : '⏳ Connecting...'}
                  </p>
                  <p>📡 Session: {sessionId || 'None'}</p>
                  <p>🧠 Thinking: {isThinking ? 'Yes' : 'No'}</p>
                  {isComplete && <p>✨ Complete!</p>}
                  {error && <p className="text-accent-error">❌ {error}</p>}
                  <p>📊 Nodes: {storeNodes.length}</p>
                </>
              ) : (
                <>
                  <p>✅ Nodes: {nodeCount}/{testNodes.length}</p>
                </>
              )}
              
              <div className="mt-2 text-[0.85rem] p-2 bg-white/5 rounded">
                <strong className="font-semibold">Controls:</strong>
                <p className="my-1">🖱️ Drag - Pan view</p>
                <p className="my-1">🔍 Scroll - Zoom in/out</p>
                <p className="my-1">🖱️ Click node - Show details</p>
                <p className="my-1">🖱️ Double-click - Focus on node</p>
              </div>
              
              <div className="mt-2 text-[0.85rem]">
                <strong className="font-semibold">Node Types:</strong>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  <span className="inline-block px-2.5 py-1 rounded bg-node-analysis text-white text-[0.7rem] font-semibold uppercase tracking-wide">Analysis</span>
                  <span className="inline-block px-2.5 py-1 rounded bg-node-decision text-white text-[0.7rem] font-semibold uppercase tracking-wide">Decision</span>
                  <span className="inline-block px-2.5 py-1 rounded bg-node-verification text-white text-[0.7rem] font-semibold uppercase tracking-wide">Verify</span>
                  <span className="inline-block px-2.5 py-1 rounded bg-node-alternative text-white text-[0.7rem] font-semibold uppercase tracking-wide">Alt</span>
                  <span className="inline-block px-2.5 py-1 rounded bg-node-implementation text-white text-[0.7rem] font-semibold uppercase tracking-wide">Impl</span>
                </div>
              </div>
              <button 
                onClick={() => setShowScene(false)}
                className="mt-3 w-full px-5 py-2.5 bg-bg-secondary text-text-primary border border-border-default rounded-md text-sm font-medium hover:border-border-strong hover:bg-bg-tertiary transition-all duration-fast"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="flex min-h-screen relative mx-4 md:mx-8 lg:mx-36 border-l border-r border-gray-200 bg-transparent">
      {/* Top left project title */}
      <div className="absolute top-8 left-8">
        <header className="text-sm text-gray-800 font-medium">
          Let's Think Step by Step
        </header>
        <header className="text-sm text-gray-500 tracking-normal">
          By <a href="https://moorching.com" className="underline underline-offset-2" target="_self">Akash Moorching</a>
        </header>
      </div>


      {/* Center content - problem submission */}
      <div className="flex items-center justify-center w-full px-8">
        <div className="max-w-2xl w-full text-left">
        <p className="text-gray-800 text-sm leading-relaxed mb-8">
          Inspired by <a
            href="https://www.anthropic.com/research/tracing-thoughts-language-model"
            className="underline underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >Anthropic's circuit tracing research</a> on how language models think, <span className="font-bold text-gray-900">Stepper</span> renders Claude 4.5's internal reasoning chain as an interactive force-directed graph. Watch as thought nodes emerge in real-time: analytical steps, decision points, verification checks, and alternative approaches Claude considers and discards.
          <br /><br />
          Submit a complex coding problem, system design challenge, or algorithmic puzzle below. Each node represents a distinct reasoning step—hover to read the full thought, click to explore dependencies, and trace the logical pathway from problem to solution.
        </p>

          {/* Problem submission form */}
          <form onSubmit={handleSubmitProblem} className="mb-6">
            {/* Example problem buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              {exampleProblems.map((example, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setProblem(example)}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {example}
                </button>
              ))}
            </div>

            <textarea
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="Describe your problem... (e.g., How would you implement a distributed cache?)"
              rows={4}
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 text-sm resize-vertical focus:outline-none focus:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed mb-3"
            />
            
            {submitError && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
                {submitError}
              </div>
            )}
            
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-gray-500">
                {problem.length}/5000 characters (minimum 10)
              </div>
              <button 
                type="submit"
                disabled={isSubmitting || problem.trim().length < 10}
                className="px-6 py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Analyzing...' : 'Start Analysis'}
              </button>
            </div>
          </form>

          {/* Demo link */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                setUseWebSocketMode(false)
                setShowScene(true)
              }}
              className="text-gray-600 hover:text-gray-800 text-sm flex items-center gap-2 transition-all duration-200 hover:translate-x-1"
            >
              View demo visualization
              <span className="inline-block">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right side bottom navigation */}
      <nav className="absolute bottom-8 right-8 flex flex-col gap-4 items-end">
        <a
          href="https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking"
          className="text-gray-600 hover:text-gray-800 text-sm flex items-center gap-2 transition-all duration-200 hover:translate-x-1"
          target="_blank"
          rel="noopener noreferrer"
        >
          Docs
          <span className="inline-block">↗</span>
        </a>

        <a
          href="https://github.com/AMOORCHING/stepper"
          className="text-gray-600 hover:text-gray-800 text-sm flex items-center gap-2 transition-all duration-200 hover:translate-x-1"
          target="_blank"
          rel="noopener noreferrer"
        >
          Github
          <span className="inline-block">↗</span>
        </a>
      </nav>
    </main>
  )
}

export default App
