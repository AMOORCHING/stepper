import { useRef } from 'react'
import { Line } from '@react-three/drei'
import { getEdgeStyle } from '../utils/nodeColors'

/**
 * ThoughtEdge3D - Renders a connection between two thought nodes
 * 
 * Props:
 * @param {object} edge - Edge data containing:
 *   - from: source node ID
 *   - to: target node ID
 *   - relationshipType: 'logical', 'temporal', or 'alternative'
 *   - strength: 0-1 value affecting line width (optional, defaults to 0.5)
 * @param {object} fromNode - Source node with position {x, y, z}
 * @param {object} toNode - Target node with position {x, y, z}
 */
export default function ThoughtEdge3D({ edge, fromNode, toNode }) {
  const lineRef = useRef()
  
  if (!fromNode || !toNode) return null
  
  // Get style based on relationship type
  const style = getEdgeStyle(edge.relationshipType || 'logical')
  
  // Calculate line width based on connection strength (1-3 pixels)
  // Default strength to 0.5 if not provided
  const strength = edge.strength !== undefined ? edge.strength : 0.5
  const lineWidth = 1 + (strength * 2) // Range: 1-3
  
  // Create points array for the line
  const points = [
    [fromNode.position.x, fromNode.position.y, fromNode.position.z],
    [toNode.position.x, toNode.position.y, toNode.position.z]
  ]

  return (
    <Line
      ref={lineRef}
      points={points}
      color={style.color}
      lineWidth={lineWidth}
      transparent={true}
      opacity={style.opacity}
      dashed={false}
    />
  )
}

