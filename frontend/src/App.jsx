import { useState } from 'react'
import ThinkingScene from './components/ThinkingScene'
import ThoughtNode3D from './components/ThoughtNode3D'
import ThoughtEdge3D from './components/ThoughtEdge3D'

// Test data: multiple nodes with different types
const testNodes = [
  {
    id: 'node1',
    type: 'Analysis',
    confidence: 0.8,
    position: { x: 0, y: 5, z: 0 },
    content: 'Initial analysis of the problem'
  },
  {
    id: 'node2',
    type: 'Decision',
    confidence: 0.9,
    position: { x: -3, y: 0, z: 2 },
    content: 'Decision point: choose approach A'
  },
  {
    id: 'node3',
    type: 'Alternative',
    confidence: 0.6,
    position: { x: 3, y: 0, z: 2 },
    content: 'Alternative approach B'
  },
  {
    id: 'node4',
    type: 'Verification',
    confidence: 1.0,
    position: { x: 0, y: -5, z: 0 },
    content: 'Verify solution correctness'
  },
  {
    id: 'node5',
    type: 'Implementation',
    confidence: 0.7,
    position: { x: 0, y: -10, z: -2 },
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

function TestNodes() {
  const [selectedNode, setSelectedNode] = useState(null)
  
  const handleNodeClick = (node) => {
    setSelectedNode(node)
    console.log('Node clicked:', node)
  }
  
  const handleNodeHover = (node, isHovering) => {
    console.log('Node hover:', node.id, isHovering)
  }
  
  return (
    <>
      {/* Render edges first (so they appear behind nodes) */}
      {testEdges.map((edge, index) => {
        const fromNode = testNodes.find(n => n.id === edge.from)
        const toNode = testNodes.find(n => n.id === edge.to)
        return (
          <ThoughtEdge3D
            key={`edge-${index}`}
            edge={edge}
            fromNode={fromNode}
            toNode={toNode}
          />
        )
      })}
      
      {/* Render nodes */}
      {testNodes.map(node => (
        <ThoughtNode3D
          key={node.id}
          node={node}
          onClick={handleNodeClick}
          onHover={handleNodeHover}
        />
      ))}
    </>
  )
}

function App() {
  const [showScene, setShowScene] = useState(false)

  if (showScene) {
    return (
      <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
        <ThinkingScene>
          <TestNodes />
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
            <div className="panel-title">Node & Edge Rendering Test</div>
            <div className="panel-content">
              <p>✅ 5 nodes with different types</p>
              <p>✅ 5 edges with varied styles</p>
              <p>✅ Emissive materials active</p>
              <p>✅ Confidence-based scaling</p>
              <p>✅ Click/hover interactions</p>
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
