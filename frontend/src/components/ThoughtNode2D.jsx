import { useRef, useEffect, useState } from 'react'
import { getNodeColor } from '../utils/nodeColors'
import { animateNodeAppearance, animateNodePulse, stopNodePulse, animateNodeHover } from '../utils/animations2d'

/**
 * ThoughtNode2D - Renders a single thought node as a sharp rectangular box
 * 
 * Props:
 * @param {object} node - Node data containing:
 *   - id: unique identifier
 *   - type: ThoughtType (Analysis, Decision, etc.)
 *   - confidence: 0-1 value affecting node opacity
 *   - position: {x, y} coordinates
 *   - content: text content
 * @param {function} onClick - Click handler
 * @param {function} onDoubleClick - Double-click handler
 * @param {function} onHover - Hover handler
 * @param {number} appearDelay - Delay before appearance animation (ms)
 * @param {boolean} isPulsing - Whether this node should pulse (for active/newest node)
 */
export default function ThoughtNode2D({ 
  node, 
  onClick, 
  onDoubleClick, 
  onHover, 
  appearDelay = 0, 
  isPulsing = false 
}) {
  const positionGroupRef = useRef()
  const animationGroupRef = useRef()
  const [pulseAnimation, setPulseAnimation] = useState(null)
  const [isHovered, setIsHovered] = useState(false)
  const lastClickTime = useRef(0)
  
  // Get color based on node type
  const color = getNodeColor(node.type)
  
  // Node dimensions - following PRD0 specifications
  const width = 140
  const height = 60
  const radius = 24 // Node visual radius for consistent sizing
  
  // Appearance animation on mount - only run once per node
  useEffect(() => {
    if (animationGroupRef.current) {
      animateNodeAppearance(animationGroupRef, appearDelay)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  // Pulse animation for active node
  useEffect(() => {
    if (isPulsing && animationGroupRef.current) {
      const animation = animateNodePulse(animationGroupRef)
      setPulseAnimation(animation)
      
      return () => {
        stopNodePulse(animation, animationGroupRef)
      }
    } else if (pulseAnimation) {
      stopNodePulse(pulseAnimation, animationGroupRef)
      setPulseAnimation(null)
    }
  }, [isPulsing])
  
  const handleClick = (e) => {
    e.stopPropagation()
    
    const currentTime = Date.now()
    const timeSinceLastClick = currentTime - lastClickTime.current
    
    // Detect double-click (within 300ms)
    if (timeSinceLastClick < 300) {
      if (onDoubleClick) onDoubleClick(node)
      lastClickTime.current = 0
    } else {
      if (onClick) onClick(node)
      lastClickTime.current = currentTime
    }
  }
  
  const handleMouseEnter = (e) => {
    e.stopPropagation()
    setIsHovered(true)
    animateNodeHover(animationGroupRef, true)
    if (onHover) onHover(node, true)
  }
  
  const handleMouseLeave = (e) => {
    e.stopPropagation()
    setIsHovered(false)
    animateNodeHover(animationGroupRef, false)
    if (onHover) onHover(node, false)
  }

  // Truncate content for display
  const displayContent = node.content.length > 30 
    ? node.content.substring(0, 30) + '...'
    : node.content

  // Ensure valid position values
  const posX = Number.isFinite(node.position?.x) ? node.position.x : 0
  const posY = Number.isFinite(node.position?.y) ? node.position.y : 0

  return (
    <g
      ref={positionGroupRef}
      transform={`translate(${posX}, ${posY})`}
    >
      {/* Separate group for animations to avoid transform conflicts */}
      <g
        ref={animationGroupRef}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: 'pointer' }}
      >
      {/* Main rectangle - research-grade styling with rounded corners */}
      <rect
        x={-width / 2}
        y={-height / 2}
        width={width}
        height={height}
        rx={8}
        ry={8}
        fill="var(--bg-secondary)"
        stroke={color}
        strokeWidth={isHovered ? 3 : 2}
        opacity={0.7 + (node.confidence * 0.3)}
        filter={isHovered ? "drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.07))" : "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.05))"}
      />
      
      {/* Type label bar at top - rounded top corners */}
      <rect
        x={-width / 2}
        y={-height / 2}
        width={width}
        height={18}
        rx={8}
        ry={8}
        fill={color}
        opacity={0.9}
      />
      {/* Cover bottom corners of type label */}
      <rect
        x={-width / 2}
        y={-height / 2 + 10}
        width={width}
        height={8}
        fill={color}
        opacity={0.9}
      />
      
      {/* Type text */}
      <text
        x={0}
        y={-height / 2 + 13}
        textAnchor="middle"
        fill="white"
        fontSize="10"
        fontWeight="600"
        letterSpacing="0.025em"
        style={{ userSelect: 'none', pointerEvents: 'none', fontFamily: 'Inter, sans-serif' }}
      >
        {node.type.toUpperCase()}
      </text>
      
      {/* Content text */}
      <text
        x={0}
        y={8}
        textAnchor="middle"
        fill="var(--text-primary)"
        fontSize="11"
        style={{ userSelect: 'none', pointerEvents: 'none', fontFamily: 'Inter, sans-serif' }}
      >
        {displayContent}
      </text>
      
      {/* Confidence indicator - small rectangle at bottom */}
      <rect
        x={-width / 2 + 4}
        y={height / 2 - 8}
        width={(width - 8) * node.confidence}
        height={3}
        fill={color}
        opacity={0.9}
      />
      </g>
    </g>
  )
}

