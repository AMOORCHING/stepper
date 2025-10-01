import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera, OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'

/**
 * ThinkingScene - Main 3D visualization component for thought nodes
 * 
 * This component sets up the Three.js scene with:
 * - Camera positioned at [0, 10, 30]
 * - Dark ambient lighting (#1a1a2e)
 * - Three point lights for depth and dimension
 * - OrbitControls for user interaction
 * - Bloom post-processing for glowing emissive materials
 * 
 * @param {ReactNode} children - Child components to render in the scene
 * @param {boolean} enableBloom - Enable bloom post-processing (default: true)
 */
export default function ThinkingScene({ children, enableBloom = true }) {
  return (
    <div style={{ 
      width: '100%', 
      height: '100vh', 
      position: 'relative',
      overflow: 'hidden'
    }}>
      <Canvas
        gl={{ 
          alpha: true, 
          antialias: true,
          powerPreference: 'high-performance'
        }}
        style={{ background: '#0a0a0f' }}
      >
        {/* Camera Setup - FOV 75, positioned for optimal view */}
        <PerspectiveCamera
          makeDefault
          fov={75}
          position={[0, 10, 30]}
          near={0.1}
          far={1000}
        />

        {/* Ambient Light - Subtle dark blue-purple tint */}
        <ambientLight 
          color="#1a1a2e" 
          intensity={0.3} 
        />

        {/* Point Light 1 - Top right front */}
        <pointLight
          position={[10, 10, 10]}
          intensity={0.8}
          color="#ffffff"
          distance={100}
          decay={2}
        />

        {/* Point Light 2 - Bottom left front */}
        <pointLight
          position={[-10, -10, 10]}
          intensity={0.8}
          color="#ffffff"
          distance={100}
          decay={2}
        />

        {/* Point Light 3 - Top back */}
        <pointLight
          position={[0, 20, -10]}
          intensity={0.8}
          color="#ffffff"
          distance={100}
          decay={2}
        />

        {/* Orbit Controls for camera manipulation */}
        <OrbitControls
          enableDamping={true}
          dampingFactor={0.05}
          minDistance={10}
          maxDistance={100}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
        />

        {/* Child components (nodes, edges, etc.) will render here */}
        {children}

        {/* Post-processing effects */}
        {enableBloom && (
          <EffectComposer>
            <Bloom
              intensity={1.5}
              luminanceThreshold={0.1}
              luminanceSmoothing={0.9}
              radius={0.4}
              mipmapBlur={false}
            />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  )
}

