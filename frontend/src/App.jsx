import { useState, useEffect } from 'react'
import ThinkingScene from './components/ThinkingScene'
import ThoughtNode3D from './components/ThoughtNode3D'
import ThoughtEdge3D from './components/ThoughtEdge3D'
import { updateNodePositions } from './utils/layoutAlgorithm'

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

function TestNodes({ nodes = testNodes }) {
  const [selectedNode, setSelectedNode] = useState(null)
  
  const handleNodeClick = (node) => {
    setSelectedNode(node)
    console.log('Node clicked:', node)
  }
  
  const handleNodeHover = (node, isHovering) => {
    console.log('Node hover:', node.id, isHovering)
  }
  
  // Stagger delay: 100ms between each node
  const STAGGER_DELAY = 100
  
  // Mark the last node as pulsing (most recently added)
  const newestNodeId = nodes[nodes.length - 1]?.id

  return (
    <>
      {/* Render edges first (so they appear behind nodes) */}
      {testEdges.map((edge, index) => {
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
          <ThoughtEdge3D
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
        <ThoughtNode3D
          key={node.id}
          node={node}
          onClick={handleNodeClick}
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
  const [enableBloom, setEnableBloom] = useState(true)
  const [enableAutoRotation, setEnableAutoRotation] = useState(true)
  const [nodeCount, setNodeCount] = useState(0)
  
  // Auto-focus on newest node (for first 10 nodes only)
  const autoFocusNode = nodeCount < 10 && nodeCount > 0 && testNodes[nodeCount - 1]
    ? testNodes[nodeCount - 1].position
    : null
  
  // Simulate nodes appearing over time (for demo)
  useEffect(() => {
    if (!showScene) {
      setNodeCount(0)
      return
    }
    
    const timer = setTimeout(() => {
      if (nodeCount < testNodes.length) {
        setNodeCount(prev => prev + 1)
      }
    }, nodeCount === 0 ? 800 : 900) // First node after 800ms, then 900ms between nodes
    
    return () => clearTimeout(timer)
  }, [showScene, nodeCount])

  if (showScene) {
    // Only show nodes that have "appeared" (for demo purposes)
    const visibleNodes = testNodes.slice(0, nodeCount)
    
    return (
      <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
        <ThinkingScene 
          enableBloom={enableBloom}
          enableAutoRotation={enableAutoRotation}
          autoFocusNode={autoFocusNode}
        >
          <TestNodes nodes={visibleNodes} />
        </ThinkingScene>
        
        {/* Info overlay */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 10,
          maxWidth: '350px'
        }}>
          <div className="panel">
            <div className="panel-title">3D Visualization Active</div>
            <div className="panel-content">
              <p>✅ Auto-focus on nodes ({Math.min(nodeCount, 10)}/10)</p>
              <p>✅ Auto-rotation: {enableAutoRotation ? 'On (after 5s idle)' : 'Off'}</p>
              <p>✅ Bloom effect: {enableBloom ? 'Active' : 'Disabled'}</p>
              <p>✅ Nodes visible: {nodeCount}/{testNodes.length}</p>
              
              <div style={{ marginTop: '10px', fontSize: '0.85rem', padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                <strong>Keyboard Shortcuts:</strong>
                <p style={{ margin: '4px 0' }}>⌨️ <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: '2px' }}>R</code> - Reset camera</p>
                <p style={{ margin: '4px 0' }}>🖱️ Drag - Rotate view</p>
                <p style={{ margin: '4px 0' }}>🔍 Scroll - Zoom in/out</p>
              </div>
              
              <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => setEnableBloom(!enableBloom)}
                  style={{ flex: 1 }}
                >
                  {enableBloom ? '✨ Bloom' : '💡 Bloom'}
                </button>
                <button 
                  onClick={() => setEnableAutoRotation(!enableAutoRotation)}
                  style={{ flex: 1 }}
                >
                  {enableAutoRotation ? '🔄 Rotate' : '⏸️ Rotate'}
                </button>
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
        🧠 Stepper - 3D Thinking Visualization
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
        <div className="panel-title">✅ Task 2.0 Complete - Three.js Scene Foundation</div>
        <div className="panel-content">
          <p>✅ ThinkingScene component created</p>
          <p>✅ Camera configured (FOV 75, position [0, 10, 30])</p>
          <p>✅ Ambient light (#1a1a2e, intensity 0.3)</p>
          <p>✅ 3 Point lights positioned</p>
          <p>✅ OrbitControls with damping enabled</p>
        </div>
      </div>

      <div className="panel" style={{ maxWidth: '800px' }}>
        <div className="panel-title">✅ Task 3.0 Complete - Node & Edge Rendering</div>
        <div className="panel-content">
          <p>✅ nodeColors.js with all ThoughtType colors</p>
          <p>✅ ThoughtNode3D with SphereGeometry</p>
          <p>✅ Emissive materials with type-based colors</p>
          <p>✅ Confidence-based scaling (0.7-1.3 range)</p>
          <p>✅ ThoughtEdge3D with Line rendering</p>
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
          <p>✅ Y position: -depth × 5 units</p>
          <p>✅ X position: centered with 3-unit spacing</p>
          <p>✅ Z position: random -2 to +2 variation</p>
          <p>✅ updateNodePositions helper function</p>
        </div>
      </div>

      <div className="panel" style={{ maxWidth: '800px' }}>
        <div className="panel-title">✅ Task 5.0 Complete - Animation System</div>
        <div className="panel-content">
          <p>✅ animations.js with anime.js helpers</p>
          <p>✅ Node appearance: elastic bounce (800ms)</p>
          <p>✅ Node pulse: oscillating emissive (2000ms)</p>
          <p>✅ Edge drawing: fade-in effect (500ms)</p>
          <p>✅ Stagger delay: 100ms between nodes</p>
          <p>✅ Newest node marked as pulsing</p>
          <p>✅ Hover animation: smooth scale to 1.3x</p>
        </div>
      </div>

      <div className="panel" style={{ maxWidth: '800px' }}>
        <div className="panel-title">✅ Task 6.0 Complete - Bloom Post-Processing</div>
        <div className="panel-content">
          <p>✅ EffectComposer integrated</p>
          <p>✅ Bloom effect: intensity 1.5</p>
          <p>✅ Luminance threshold: 0.1</p>
          <p>✅ Luminance smoothing: 0.9</p>
          <p>✅ Bloom radius: 0.4</p>
          <p>✅ Affects emissive materials (nodes)</p>
          <p>✅ Toggleable for performance</p>
        </div>
      </div>

      <div className="panel" style={{ maxWidth: '800px' }}>
        <div className="panel-title">✅ Task 7.0 Complete - Camera Controls & Auto-Focus</div>
        <div className="panel-content">
          <p>✅ OrbitControls with damping (0.05)</p>
          <p>✅ Distance limits: 10-100 units</p>
          <p>✅ useCameraAnimation hook created</p>
          <p>✅ focusOnNode function (45° angle, 1500ms)</p>
          <p>✅ Auto-focus on first 10 nodes</p>
          <p>✅ Auto-rotation when idle (5 seconds, 0.1 rad/sec)</p>
          <p>✅ Keyboard shortcut 'R' to reset camera</p>
          <button 
            onClick={() => setShowScene(true)}
            style={{ marginTop: '10px', width: '100%' }}
          >
            🚀 Launch 3D Visualization →
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
            <li>📦 three@^0.160.0</li>
            <li>📦 @react-three/fiber@^8.18.0</li>
            <li>📦 @react-three/drei@^9.122.0</li>
            <li>📦 @react-three/postprocessing@^2.19.1</li>
            <li>📦 animejs@^3.2.2</li>
            <li>📦 zustand@^4.5.7</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default App
