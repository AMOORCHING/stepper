// Quick test component to verify Three.js imports
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

function TestCube() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#4ECDC4" />
    </mesh>
  )
}

export default function ThreeTest() {
  return (
    <div style={{ width: '100%', height: '400px', border: '2px solid #2a2a3e' }}>
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <TestCube />
        <OrbitControls />
      </Canvas>
    </div>
  )
}

