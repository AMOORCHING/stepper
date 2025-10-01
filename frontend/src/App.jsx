import { useState, useEffect, useRef } from 'react'
import ThinkingScene2D from './components/ThinkingScene2D'
import ThoughtNode2D from './components/ThoughtNode2D'
import ThoughtEdge2D from './components/ThoughtEdge2D'
import NodeDetailPanel from './components/NodeDetailPanel'
import { updateNodePositions } from './utils/layoutAlgorithm'
import { useThinkingStore } from './store/thinkingStore'
import { useWebSocket } from './hooks/useWebSocket'
import ProblemSubmitForm from './components/ProblemSubmitForm'
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
          <div style={{ position: 'relative', flex: 1 }}>
        {/* Loading Spinner */}
        {isLoading && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-primary)',
            zIndex: 10000,
            animation: 'fadeOut 0.5s ease-out 1s forwards'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              border: '4px solid rgba(37, 99, 235, 0.2)',
              borderTop: '4px solid var(--accent-primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>
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
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 10,
          maxWidth: '350px'
        }}>
          <div className="panel">
            <div className="panel-title">
              {useWebSocketMode ? '🔗 WebSocket Mode' : '🎬 Demo Mode'}
            </div>
            <div className="panel-content">
              {useWebSocketMode ? (
                <>
                  <p>
                    {isConnected ? '✅ Connected' : connectionError ? '❌ Error' : '⏳ Connecting...'}
                  </p>
                  <p>📡 Session: {sessionId || 'None'}</p>
                  <p>🧠 Thinking: {isThinking ? 'Yes' : 'No'}</p>
                  {isComplete && <p>✨ Complete!</p>}
                  {error && <p style={{ color: '#FF6B6B' }}>❌ {error}</p>}
                  <p>📊 Nodes: {storeNodes.length}</p>
                </>
              ) : (
                <>
                  <p>✅ Nodes: {nodeCount}/{testNodes.length}</p>
                </>
              )}
              
              <div style={{ marginTop: '10px', fontSize: '0.85rem', padding: '8px', background: 'rgba(255,255,255,0.05)' }}>
                <strong>Controls:</strong>
                <p style={{ margin: '4px 0' }}>🖱️ Drag - Pan view</p>
                <p style={{ margin: '4px 0' }}>🔍 Scroll - Zoom in/out</p>
                <p style={{ margin: '4px 0' }}>🖱️ Click node - Show details</p>
                <p style={{ margin: '4px 0' }}>🖱️ Double-click - Focus on node</p>
              </div>
              
              <div style={{ marginTop: '10px', fontSize: '0.85rem' }}>
                <strong>Node Types:</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                  <span className="badge badge-analysis" style={{ fontSize: '0.7rem' }}>Analysis</span>
                  <span className="badge badge-decision" style={{ fontSize: '0.7rem' }}>Decision</span>
                  <span className="badge badge-verification" style={{ fontSize: '0.7rem' }}>Verify</span>
                  <span className="badge badge-alternative" style={{ fontSize: '0.7rem' }}>Alt</span>
                  <span className="badge badge-implementation" style={{ fontSize: '0.7rem' }}>Impl</span>
                </div>
              </div>
              <button 
                onClick={() => setShowScene(false)}
                style={{ marginTop: '12px', width: '100%' }}
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
        
        {/* Loading and animation styles */}
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            @keyframes fadeOut {
              0% { opacity: 1; visibility: visible; }
              99% { opacity: 0; visibility: visible; }
              100% { opacity: 0; visibility: hidden; }
            }
          `}
        </style>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      {/* Hero Section with Grid Background */}
      <div className="relative flex-1 overflow-hidden">
        {/* Grid Pattern Background */}
        <div className="absolute inset-0 bg-bg-primary" style={{
          backgroundImage: `
            linear-gradient(to right, #E5E5E5 1px, transparent 1px),
            linear-gradient(to bottom, #E5E5E5 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          opacity: 0.4
        }} />
        
        {/* Subtle Dot Pattern Overlay */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, #D4D4D4 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          opacity: 0.15
        }} />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center px-8 py-20 max-w-6xl mx-auto">
          
          {/* Hero Text */}
          <div className="text-center mb-16 max-w-4xl">
            <h1 className="text-5xl font-semibold text-text-primary mb-6 tracking-tight leading-tight">
              Visualize AI Reasoning
            </h1>
            <p className="text-xl text-text-secondary leading-relaxed mb-8">
              Watch Claude's extended thinking unfold in real-time. See every thought node, decision point, and reasoning path visualized as an interactive graph.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setUseWebSocketMode(false)
                  setShowScene(true)
                }}
                className="px-8 py-4 bg-accent-primary text-white font-semibold rounded-md hover:bg-[#1D4ED8] transition-all duration-fast shadow-md hover:shadow-lg"
              >
                Try Demo
              </button>
              <button
                onClick={() => {
                  const formElement = document.getElementById('problem-form')
                  formElement?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="px-8 py-4 bg-bg-secondary text-text-primary font-semibold rounded-md border border-border-default hover:border-border-strong hover:bg-bg-tertiary transition-all duration-fast"
              >
                Submit Problem →
              </button>
            </div>
          </div>
          
          {/* Visualization Preview/Demo Stats */}
          <div className="grid grid-cols-3 gap-8 mb-20 max-w-2xl w-full">
            <div className="text-center">
              <div className="text-4xl font-bold text-accent-primary mb-2">5</div>
              <div className="text-sm text-text-secondary uppercase tracking-wide">Node Types</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent-primary mb-2">Real-time</div>
              <div className="text-sm text-text-secondary uppercase tracking-wide">Updates</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent-primary mb-2">2D</div>
              <div className="text-sm text-text-secondary uppercase tracking-wide">Graph View</div>
            </div>
          </div>
          
          {/* Node Types Legend */}
          <div className="mb-20 max-w-3xl w-full">
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide mb-6 text-center">
              Thought Node Types
            </h3>
            <div className="grid grid-cols-5 gap-4">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-md bg-node-analysis flex items-center justify-center text-white font-semibold text-xs">
                  A
                </div>
                <span className="text-xs text-text-secondary text-center">Analysis</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-md bg-node-decision flex items-center justify-center text-white font-semibold text-xs">
                  D
                </div>
                <span className="text-xs text-text-secondary text-center">Decision</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-md bg-node-verification flex items-center justify-center text-white font-semibold text-xs">
                  V
                </div>
                <span className="text-xs text-text-secondary text-center">Verification</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-md bg-node-alternative flex items-center justify-center text-white font-semibold text-xs">
                  A
                </div>
                <span className="text-xs text-text-secondary text-center">Alternative</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-md bg-node-implementation flex items-center justify-center text-white font-semibold text-xs">
                  I
                </div>
                <span className="text-xs text-text-secondary text-center">Implementation</span>
              </div>
            </div>
          </div>
          
          {/* Submit Form Section */}
          <div id="problem-form" className="w-full max-w-4xl">
            <ProblemSubmitForm
              onSessionCreated={(sessionId) => {
                console.log('Session created:', sessionId)
                setSessionId(sessionId)
                setUseWebSocketMode(true)
                setTimeout(() => {
                  setShowScene(true)
                }, 100)
              }}
            />
          </div>
          
          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-5xl w-full">
            <div className="bg-bg-secondary border border-border-subtle rounded-md p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-3">
                Interactive Exploration
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Pan, zoom, and click nodes to explore the reasoning graph. Each node reveals detailed information about that step in the thinking process.
              </p>
            </div>
            
            <div className="bg-bg-secondary border border-border-subtle rounded-md p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-3">
                Hierarchical Layout
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Automatic graph layout algorithm positions nodes based on their relationships and depth, making complex reasoning paths easy to follow.
              </p>
            </div>
            
            <div className="bg-bg-secondary border border-border-subtle rounded-md p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-3">
                Real-time Streaming
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Watch thoughts appear as they're generated. WebSocket integration provides live updates as Claude processes your problem.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
