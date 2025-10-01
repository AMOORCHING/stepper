import { useState, useEffect, useRef } from 'react'
import ThinkingScene2D from './components/ThinkingScene2D'
import ThoughtNode2D from './components/ThoughtNode2D'
import ThoughtEdge2D from './components/ThoughtEdge2D'
import NodeDetailPanel from './components/NodeDetailPanel'
import { updateNodePositions } from './utils/layoutAlgorithm'
import { useThinkingStore } from './store/thinkingStore'
import { useWebSocket } from './hooks/useWebSocket'
import ProblemSubmitForm from './components/ProblemSubmitForm'

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
      <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
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
              border: '4px solid rgba(78, 205, 196, 0.2)',
              borderTop: '4px solid #4ECDC4',
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
                ← Back to Test Page
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
    )
  }

  return (
    <div style={{ 
      padding: '40px', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '20px',
      minHeight: '100vh'
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>
        🧠 Stepper - Thinking Visualization
      </h1>
      
      <div className="panel" style={{ maxWidth: '800px' }}>
        <div className="panel-title">✅ Task 1.0 Complete - Frontend Setup</div>
        <div className="panel-content">
          <p>✅ Vite + React 18 running successfully</p>
          <p>✅ Dark theme (#0a0a0f) applied</p>
          <p>✅ Global styles loaded</p>
          <p>✅ All dependencies installed</p>
        </div>
      </div>

      <div className="panel" style={{ maxWidth: '800px' }}>
        <div className="panel-title">✅ Task 2.0 Complete - 2D Scene Foundation</div>
        <div className="panel-content">
          <p>✅ ThinkingScene2D component created</p>
          <p>✅ SVG-based rendering</p>
          <p>✅ Pan and zoom controls</p>
          <p>✅ Minimal, clean aesthetic</p>
        </div>
      </div>

      <div className="panel" style={{ maxWidth: '800px' }}>
        <div className="panel-title">✅ Task 3.0 Complete - Node & Edge Rendering</div>
        <div className="panel-content">
          <p>✅ nodeColors.js with all ThoughtType colors</p>
          <p>✅ ThoughtNode2D with sharp rectangular design</p>
          <p>✅ Solid colors, no gradients or bloom</p>
          <p>✅ Confidence-based opacity</p>
          <p>✅ ThoughtEdge2D with simple line rendering</p>
          <p>✅ Edge coloring by relationship type</p>
          <p>✅ Strength-based line width (1-3px)</p>
        </div>
      </div>

      <div className="panel" style={{ maxWidth: '800px' }}>
        <div className="panel-title">✅ Task 4.0 Complete - Layout Algorithm</div>
        <div className="panel-content">
          <p>✅ calculateHierarchicalLayout function</p>
          <p>✅ Depth calculation via graph traversal</p>
          <p>✅ Breadth indexing for siblings</p>
          <p>✅ Y position: depth × 120 pixels</p>
          <p>✅ X position: centered with 180px spacing</p>
          <p>✅ updateNodePositions helper function</p>
        </div>
      </div>

      <div className="panel" style={{ maxWidth: '800px' }}>
        <div className="panel-title">✅ Task 5.0 Complete - Animation System</div>
        <div className="panel-content">
          <p>✅ animations2d.js with anime.js helpers</p>
          <p>✅ Node appearance: simple fade-in (400ms)</p>
          <p>✅ Node pulse: subtle scale animation</p>
          <p>✅ Edge drawing: fade-in effect (300ms)</p>
          <p>✅ Stagger delay: 100ms between nodes</p>
          <p>✅ Newest node marked as pulsing</p>
          <p>✅ Hover animation: smooth scale to 1.05x</p>
        </div>
      </div>

      <div className="panel" style={{ maxWidth: '800px' }}>
        <div className="panel-title">✅ Task 6.0 Complete - View Controls</div>
        <div className="panel-content">
          <p>✅ Pan controls with mouse drag</p>
          <p>✅ Zoom controls with mouse wheel</p>
          <p>✅ Zoom buttons (+/-/reset)</p>
          <p>✅ Focus on node with double-click</p>
          <p>✅ Clean, minimal interface</p>
        </div>
      </div>

      <div className="panel" style={{ maxWidth: '800px' }}>
        <div className="panel-title">✅ Task 8.0 Complete - WebSocket Integration</div>
        <div className="panel-content">
          <p>✅ useWebSocket hook created</p>
          <p>✅ Event handlers: new_thought, thinking_complete, solution_ready, error</p>
          <p>✅ Zustand store for state management</p>
          <p>✅ Auto-layout calculation on new nodes</p>
          <p>✅ Edge building from dependencies</p>
          <p>✅ Reactive rendering from store</p>
          <p>✅ Auto-reconnect with max attempts</p>

          <ProblemSubmitForm
            onSessionCreated={(sessionId) => {
              console.log('Session created:', sessionId)
              setSessionId(sessionId)
              setUseWebSocketMode(true)
              // Small delay to ensure state is set
              setTimeout(() => {
                setShowScene(true)
              }, 100)
            }}
          />
          
          <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(78, 205, 196, 0.1)', borderRadius: '4px', border: '1px solid rgba(78, 205, 196, 0.3)' }}>
            <strong style={{ display: 'block', marginBottom: '8px' }}>WebSocket Mode:</strong>
            <input
              type="text"
              placeholder="Enter session ID"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '8px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: '4px',
                color: 'var(--text-primary)'
              }}
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={useWebSocketMode}
                onChange={(e) => setUseWebSocketMode(e.target.checked)}
              />
              <span>Enable WebSocket Mode</span>
            </label>
          </div>
          
          <button 
            onClick={() => setShowScene(true)}
            style={{ marginTop: '10px', width: '100%' }}
          >
            🚀 Launch Visualization →
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <span className="badge badge-analysis">Analysis</span>
        <span className="badge badge-decision">Decision</span>
        <span className="badge badge-verification">Verification</span>
        <span className="badge badge-alternative">Alternative</span>
        <span className="badge badge-implementation">Implementation</span>
      </div>

      <div className="panel" style={{ maxWidth: '800px' }}>
        <div className="panel-title">Installed Dependencies</div>
        <div className="panel-content">
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>📦 animejs@^3.2.2</li>
            <li>📦 zustand@^4.5.7</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default App
