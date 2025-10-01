import { useRef, useEffect, useState } from 'react'
import { getNodeColor } from '../utils/nodeColors'
import { animateNodeAppearance, animateNodePulse, stopNodePulse, animateNodeHover } from '../utils/animations'

/**
 * ThoughtNode3D - Renders a single thought node as a 3D sphere
 * 
 * Props:
 * @param {object} node - Node data containing:
 *   - id: unique identifier
 *   - type: ThoughtType (Analysis, Decision, etc.)
 *   - confidence: 0-1 value affecting node scale
 *   - position: {x, y, z} coordinates
 *   - content: text content
 * @param {function} onClick - Click handler
 * @param {function} onHover - Hover handler
 * @param {number} appearDelay - Delay before appearance animation (ms)
 * @param {boolean} isPulsing - Whether this node should pulse (for active/newest node)
 */
export default function ThoughtNode3D({ node, onClick, onHover, appearDelay = 0, isPulsing = false }) {
  const meshRef = useRef()
  const [pulseAnimation, setPulseAnimation] = useState(null)
  const [isHovered, setIsHovered] = useState(false)
  
  // Get color based on node type
  const color = getNodeColor(node.type)
  
  // Calculate scale based on confidence: 0.7 + (confidence * 0.6) = range 0.7-1.3
  const baseScale = 0.7 + (node.confidence * 0.6)
  
  // Emissive intensity varies based on confidence (0.5-1.0)
  const emissiveIntensity = 0.5 + (node.confidence * 0.5)
  
  // Appearance animation on mount
  useEffect(() => {
    if (meshRef.current) {
      animateNodeAppearance(meshRef, appearDelay)
    }
  }, [appearDelay])
  
  // Pulse animation for active node
  useEffect(() => {
    if (isPulsing && meshRef.current) {
      const animation = animateNodePulse(meshRef, emissiveIntensity)
      setPulseAnimation(animation)
      
      return () => {
        stopNodePulse(animation, meshRef, emissiveIntensity)
      }
    } else if (pulseAnimation) {
      stopNodePulse(pulseAnimation, meshRef, emissiveIntensity)
      setPulseAnimation(null)
    }
  }, [isPulsing, emissiveIntensity])
  
  const handleClick = (e) => {
    e.stopPropagation()
    if (onClick) onClick(node)
  }
  
  const handlePointerOver = (e) => {
    e.stopPropagation()
    document.body.style.cursor = 'pointer'
    setIsHovered(true)
    
    // Animate scale up on hover (1.3x)
    animateNodeHover(meshRef, baseScale * 1.3, 200)
    
    if (onHover) onHover(node, true)
  }
  
  const handlePointerOut = (e) => {
    e.stopPropagation()
    document.body.style.cursor = 'default'
    setIsHovered(false)
    
    // Animate scale back to original
    animateNodeHover(meshRef, baseScale, 200)
    
    if (onHover) onHover(node, false)
  }

  return (
    <mesh
      ref={meshRef}
      position={[node.position.x, node.position.y, node.position.z]}
      scale={baseScale}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* Sphere geometry - radius 0.5, 32 segments for smoothness */}
      <sphereGeometry args={[0.5, 32, 32]} />
      
      {/* Phong material with emissive properties for glow effect */}
      <meshPhongMaterial
        color={color}
        emissive={color}
        emissiveIntensity={emissiveIntensity}
        shininess={100}
        specular="#ffffff"
      />
    </mesh>
  )
}

