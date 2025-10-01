import { useRef } from 'react'
import { getNodeColor } from '../utils/nodeColors'

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
 */
export default function ThoughtNode3D({ node, onClick, onHover }) {
  const meshRef = useRef()
  
  // Get color based on node type
  const color = getNodeColor(node.type)
  
  // Calculate scale based on confidence: 0.7 + (confidence * 0.6) = range 0.7-1.3
  const scale = 0.7 + (node.confidence * 0.6)
  
  // Emissive intensity varies based on confidence (0.5-1.0)
  const emissiveIntensity = 0.5 + (node.confidence * 0.5)
  
  const handleClick = (e) => {
    e.stopPropagation()
    if (onClick) onClick(node)
  }
  
  const handlePointerOver = (e) => {
    e.stopPropagation()
    document.body.style.cursor = 'pointer'
    if (onHover) onHover(node, true)
  }
  
  const handlePointerOut = (e) => {
    e.stopPropagation()
    document.body.style.cursor = 'default'
    if (onHover) onHover(node, false)
  }

  return (
    <mesh
      ref={meshRef}
      position={[node.position.x, node.position.y, node.position.z]}
      scale={scale}
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

