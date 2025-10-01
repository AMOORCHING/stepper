import { useRef, useEffect } from 'react'
import { getEdgeStyle } from '../utils/nodeColors'
import { animateEdgeDrawing } from '../utils/animations2d'

/**
 * ThoughtEdge2D - Renders a connection between two thought nodes as a simple line
 * 
 * Props:
 * @param {object} edge - Edge data containing:
 *   - from: source node ID
 *   - to: target node ID
 *   - relationshipType: 'logical', 'temporal', or 'alternative'
 *   - strength: 0-1 value affecting line width (optional, defaults to 0.5)
 * @param {object} fromNode - Source node with position {x, y}
 * @param {object} toNode - Target node with position {x, y}
 * @param {number} appearDelay - Delay before edge appears (ms)
 */
export default function ThoughtEdge2D({ edge, fromNode, toNode, appearDelay = 0 }) {
  const lineRef = useRef()
  
  // Animate edge drawing on mount
  useEffect(() => {
    if (lineRef.current) {
      animateEdgeDrawing(lineRef, appearDelay)
    }
  }, [appearDelay])
  
  if (!fromNode || !toNode) return null
  
  // Get style based on relationship type
  const style = getEdgeStyle(edge.relationshipType || 'logical')
  
  // Calculate line width based on connection strength - following PRD0 (1.5px default)
  const strength = edge.strength !== undefined ? edge.strength : 0.5
  const lineWidth = 1.5 + (strength * 1) // Range: 1.5-2.5px

  return (
    <line
      ref={lineRef}
      x1={fromNode.position.x}
      y1={fromNode.position.y}
      x2={toNode.position.x}
      y2={toNode.position.y}
      stroke={style.color}
      strokeWidth={lineWidth}
      opacity={style.opacity}
      strokeLinecap="square"
    />
  )
}

