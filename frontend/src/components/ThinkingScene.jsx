import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera, OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useRef, useEffect, useState } from 'react'
import { useCameraAnimation } from '../hooks/useCameraAnimation'

/**
 * Scene Content with camera controls and auto-rotation
 */
function SceneContent({ 
  children, 
  onCameraReady, 
  enableAutoRotation, 
  autoFocusNode 
}) {
  const { camera, gl } = useThree()
  const controlsRef = useRef()
  const lastInteractionTime = useRef(Date.now())
  const rotationRef = useRef(0)
  const [isAutoRotating, setIsAutoRotating] = useState(false)
  
  const { focusOnNode, resetCamera } = useCameraAnimation(camera, controlsRef.current)
  
  // Notify parent that camera is ready
  useEffect(() => {
    if (camera && controlsRef.current && onCameraReady) {
      onCameraReady({ camera, controls: controlsRef.current, focusOnNode, resetCamera })
    }
  }, [camera, onCameraReady, focusOnNode, resetCamera])
  
  // Auto-focus on node when specified
  useEffect(() => {
    if (autoFocusNode && focusOnNode) {
      focusOnNode(autoFocusNode, 1500, 15) // 15 units away for better view
    }
  }, [autoFocusNode, focusOnNode])
  
  // Track user interaction
  useEffect(() => {
    const handleInteraction = () => {
      lastInteractionTime.current = Date.now()
      setIsAutoRotating(false)
    }
    
    gl.domElement.addEventListener('pointerdown', handleInteraction)
    gl.domElement.addEventListener('wheel', handleInteraction)
    gl.domElement.addEventListener('touchstart', handleInteraction)
    
    return () => {
      gl.domElement.removeEventListener('pointerdown', handleInteraction)
      gl.domElement.removeEventListener('wheel', handleInteraction)
      gl.domElement.removeEventListener('touchstart', handleInteraction)
    }
  }, [gl])
  
  // Auto-rotation after idle
  useFrame((state, delta) => {
    if (!enableAutoRotation || !controlsRef.current) return
    
    const timeSinceInteraction = Date.now() - lastInteractionTime.current
    const IDLE_THRESHOLD = 5000 // 5 seconds
    
    if (timeSinceInteraction > IDLE_THRESHOLD) {
      if (!isAutoRotating) {
        setIsAutoRotating(true)
      }
      
      // Rotate at 0.1 rad/sec
      rotationRef.current += delta * 0.1
      
      // Rotate around the target point
      const target = controlsRef.current.target
      const distance = camera.position.distanceTo(target)
      
      camera.position.x = target.x + Math.cos(rotationRef.current) * distance
      camera.position.z = target.z + Math.sin(rotationRef.current) * distance
      
      camera.lookAt(target)
    }
  })
  
  return (
    <>
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
        ref={controlsRef}
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
    </>
  )
}

/**
 * ThinkingScene - Main 3D visualization component for thought nodes
 * 
 * This component sets up the Three.js scene with:
 * - Camera positioned at [0, 10, 30]
 * - Dark ambient lighting (#1a1a2e)
 * - Three point lights for depth and dimension
 * - OrbitControls for user interaction
 * - Bloom post-processing for glowing emissive materials
 * - Auto-focus on newest nodes (first 10)
 * - Auto-rotation when idle (5 seconds)
 * - Keyboard shortcuts for camera control
 * 
 * @param {ReactNode} children - Child components to render in the scene
 * @param {boolean} enableBloom - Enable bloom post-processing (default: true)
 * @param {boolean} enableAutoRotation - Enable auto-rotation when idle (default: true)
 * @param {object} autoFocusNode - Node position to auto-focus on (optional)
 * @param {function} onCameraReady - Callback when camera is ready
 */
export default function ThinkingScene({ 
  children, 
  enableBloom = true,
  enableAutoRotation = true,
  autoFocusNode = null,
  onCameraReady
}) {
  const [cameraControls, setCameraControls] = useState(null)
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!cameraControls) return
      
      // R key - Reset camera
      if (e.key === 'r' || e.key === 'R') {
        cameraControls.resetCamera()
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [cameraControls])
  
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
        <SceneContent
          onCameraReady={setCameraControls}
          enableAutoRotation={enableAutoRotation}
          autoFocusNode={autoFocusNode}
        >
          {children}
        </SceneContent>

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

