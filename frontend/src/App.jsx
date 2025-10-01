import { useState } from 'react'
import ThinkingScene from './components/ThinkingScene'

// Test sphere to verify the scene is working
function TestSphere() {
  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshPhongMaterial 
        color="#4ECDC4" 
        emissive="#4ECDC4"
        emissiveIntensity={0.5}
      />
    </mesh>
  )
}

function App() {
  const [showScene, setShowScene] = useState(false)

  if (showScene) {
    return (
      <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
        <ThinkingScene>
          <TestSphere />
        </ThinkingScene>
        
        {/* Info overlay */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 10,
          maxWidth: '300px'
        }}>
          <div className="panel">
            <div className="panel-title">ThinkingScene Active</div>
            <div className="panel-content">
              <p>✅ Camera at [0, 10, 30]</p>
              <p>✅ 3 Point Lights active</p>
              <p>✅ Ambient light (#1a1a2e)</p>
              <p>✅ OrbitControls enabled</p>
              <button 
                onClick={() => setShowScene(false)}
                style={{ marginTop: '10px', width: '100%' }}
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
          <button 
            onClick={() => setShowScene(true)}
            style={{ marginTop: '10px', width: '100%' }}
          >
            🚀 Launch ThinkingScene →
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
