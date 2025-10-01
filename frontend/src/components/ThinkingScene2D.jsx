import { useRef, useEffect, useState, useCallback } from 'react'
import * as d3 from 'd3-force'
import anime from 'animejs'

/**
 * ThinkingScene2D - Canvas-based force-directed graph visualization
 * Following PRD 2 specifications with D3-force physics and anime.js animations
 */
export default function ThinkingScene2D({ nodes = [], edges = [], onNodeClick, onNodeHover }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const simulationRef = useRef(null)
  const animationFrameRef = useRef(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const hoveredNodeRef = useRef(null)
  
  // Pan and zoom state
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })
  const isDraggingRef = useRef(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const transformRef = useRef({ x: 0, y: 0, scale: 1 })
  
  const [dimensions, setDimensions] = useState({ width: 1200, height: 750 })
  const [isReady, setIsReady] = useState(false)

  // Node and edge state with animation properties
  const nodeStateRef = useRef(new Map())
  const edgeStateRef = useRef(new Map())

  // Node colors from design system
  const NODE_COLORS = {
    Analysis: '#2563EB',
    Decision: '#DC2626',
    Verification: '#059669',
    Alternative: '#D97706',
    Implementation: '#7C3AED'
  }

  // Initialize Canvas and D3 simulation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', {
      alpha: false,
      desynchronized: true
    })

    // High-DPI support
    const dpr = window.devicePixelRatio || 1
    canvas.width = dimensions.width * dpr
    canvas.height = dimensions.height * dpr
    canvas.style.width = `${dimensions.width}px`
    canvas.style.height = `${dimensions.height}px`
    ctx.scale(dpr, dpr)

    setIsReady(true)

    // Handle resize
    const handleResize = () => {
      const container = containerRef.current
      if (container) {
        const rect = container.getBoundingClientRect()
        setDimensions({ width: rect.width, height: rect.height })
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Initialize D3 force simulation (only once)
  useEffect(() => {
    if (!isReady) return

    const { width, height } = dimensions

    // Create force simulation with empty nodes initially
    const simulation = d3.forceSimulation([])
      .force('link', d3.forceLink([])
        .id(d => d.id)
        .distance(140)
        .strength(0.7))
      .force('charge', d3.forceManyBody()
        .strength(-300)
        .distanceMax(400))
      .force('center', d3.forceCenter(width / 2, height / 2)
        .strength(0.05))
      .force('collide', d3.forceCollide()
        .radius(50)
        .strength(0.8))
      .force('x', d3.forceX(width / 2).strength(0.03))
      .force('y', d3.forceY(height / 2).strength(0.03))
      .alphaDecay(0.02)
      .velocityDecay(0.4)

    simulationRef.current = simulation

    return () => {
      if (simulation) {
        simulation.stop()
      }
    }
  }, [isReady, dimensions.width, dimensions.height])

  // Update simulation when nodes/edges change (without recreating)
  useEffect(() => {
    const simulation = simulationRef.current
    if (!simulation || !isReady) return

    const { width, height } = dimensions

    // Get current simulation nodes to preserve positions
    const currentSimNodes = simulation.nodes()
    const nodePositions = new Map(currentSimNodes.map(n => [n.id, { x: n.x, y: n.y, vx: n.vx, vy: n.vy }]))

    // Prepare nodes for D3 - preserve existing positions or set new ones
    const d3Nodes = nodes.map(node => {
      const existing = nodePositions.get(node.id)
      if (existing) {
        // Preserve position and velocity for existing nodes
        return {
          ...node,
          x: existing.x,
          y: existing.y,
          vx: existing.vx,
          vy: existing.vy
        }
      } else {
        // New node - start near center with slight randomness
        return {
          ...node,
          x: width / 2 + (Math.random() - 0.5) * 100,
          y: height / 2 + (Math.random() - 0.5) * 100,
          vx: 0,
          vy: 0
        }
      }
    })

    // Prepare edges for D3
    const d3Edges = edges.map(edge => ({
      source: edge.from,
      target: edge.to,
      strength: edge.strength || 0.7
    }))

    // Update simulation nodes and links
    simulation.nodes(d3Nodes)
    simulation.force('link').links(d3Edges)

    // Only restart with low alpha for new nodes (smooth integration)
    const hasNewNodes = d3Nodes.some(n => !nodePositions.has(n.id))
    if (hasNewNodes) {
      simulation.alpha(0.3).restart()
    } else if (currentSimNodes.length !== d3Nodes.length) {
      // Nodes were removed, gentle restart
      simulation.alpha(0.2).restart()
    }

    // Initialize node animation states for new nodes only
    d3Nodes.forEach((node) => {
      if (!nodeStateRef.current.has(node.id)) {
        const state = {
          scale: 0,
          opacity: 0,
          hoverScale: 1,
          pulseScale: 1,
          breathingScale: 1
        }
        nodeStateRef.current.set(node.id, state)

        // Entrance animation for new node
        anime({
          targets: state,
          scale: 1,
          opacity: 1,
          duration: 600,
          easing: 'easeOutCubic'
        })
      }
    })

    // Initialize edge animation states for new edges only
    d3Edges.forEach((edge) => {
      const edgeKey = `${edge.source.id || edge.source}-${edge.target.id || edge.target}`
      if (!edgeStateRef.current.has(edgeKey)) {
        const state = { drawProgress: 0 }
        edgeStateRef.current.set(edgeKey, state)

        // Edge draw animation
        anime({
          targets: state,
          drawProgress: 1,
          duration: 500,
          easing: 'easeOutQuad'
        })
      }
    })
  }, [nodes, edges, dimensions, isReady])

  // Render loop
  useEffect(() => {
    if (!isReady) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const simulation = simulationRef.current

    let lastTime = performance.now()
    let needsRender = true

    const render = (currentTime) => {
      animationFrameRef.current = requestAnimationFrame(render)

      // Throttle to 60 FPS
      const deltaTime = currentTime - lastTime
      if (deltaTime < 16) return

      lastTime = currentTime

      // Clear canvas
      ctx.fillStyle = '#FAFAFA'
      ctx.fillRect(0, 0, dimensions.width, dimensions.height)

      if (!simulation) return

      // Apply transform
      ctx.save()
      ctx.translate(transformRef.current.x, transformRef.current.y)
      ctx.scale(transformRef.current.scale, transformRef.current.scale)

      // Draw subtle grid for circuit board effect (after transform so it pans/zooms)
      ctx.strokeStyle = 'rgba(220, 220, 220, 0.3)'
      ctx.lineWidth = 1 / transformRef.current.scale // Scale-adjusted line width
      const gridSize = 50
      const visibleWidth = dimensions.width / transformRef.current.scale
      const visibleHeight = dimensions.height / transformRef.current.scale
      const offsetX = -transformRef.current.x / transformRef.current.scale
      const offsetY = -transformRef.current.y / transformRef.current.scale
      
      // Draw vertical lines
      const startX = Math.floor(offsetX / gridSize) * gridSize
      const endX = offsetX + visibleWidth
      for (let x = startX; x < endX; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, offsetY)
        ctx.lineTo(x, offsetY + visibleHeight)
        ctx.stroke()
      }
      
      // Draw horizontal lines
      const startY = Math.floor(offsetY / gridSize) * gridSize
      const endY = offsetY + visibleHeight
      for (let y = startY; y < endY; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(offsetX, y)
        ctx.lineTo(offsetX + visibleWidth, y)
        ctx.stroke()
      }

      // Get current node positions from simulation
      const simNodes = simulation.nodes()

      // Draw edges first (behind nodes)
      edges.forEach(edge => {
        const sourceNode = simNodes.find(n => n.id === edge.from)
        const targetNode = simNodes.find(n => n.id === edge.to)
        
        if (!sourceNode || !targetNode) return

        const edgeKey = `${edge.from}-${edge.to}`
        const edgeState = edgeStateRef.current.get(edgeKey) || { drawProgress: 1 }

        drawEdge(ctx, sourceNode, targetNode, edge, edgeState)
      })

      // Draw nodes
      simNodes.forEach(node => {
        const nodeState = nodeStateRef.current.get(node.id) || {
          scale: 1,
          opacity: 1,
          hoverScale: 1,
          pulseScale: 1,
          breathingScale: 1
        }

        const isHovered = hoveredNodeRef.current?.id === node.id

        drawNode(ctx, node, nodeState, isHovered)
      })

      // Restore transform
      ctx.restore()
    }

    animationFrameRef.current = requestAnimationFrame(render)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [nodes, edges, dimensions, isReady])

  // Draw node function with circuit-like styling
  const drawNode = (ctx, node, state, isHovered) => {
    const { x, y, type, confidence } = node
    const baseRadius = 24
    const totalScale = state.scale * state.hoverScale * state.pulseScale * state.breathingScale
    const radius = baseRadius * confidence * totalScale

    // Normalize type - capitalize first letter to match NODE_COLORS keys
    const normalizedType = type ? type.charAt(0).toUpperCase() + type.slice(1).toLowerCase() : 'Analysis'
    const color = NODE_COLORS[normalizedType] || NODE_COLORS.Analysis

    ctx.save()
    ctx.globalAlpha = state.opacity

    // Outer glow effect (circuit-like)
    if (isHovered) {
      const glowGradient = ctx.createRadialGradient(x, y, radius, x, y, radius + 15)
      glowGradient.addColorStop(0, color + '40') // 25% opacity
      glowGradient.addColorStop(1, color + '00') // 0% opacity
      ctx.fillStyle = glowGradient
      ctx.beginPath()
      ctx.arc(x, y, radius + 15, 0, Math.PI * 2)
      ctx.fill()
    }

    // Main node with gradient for depth
    const nodeGradient = ctx.createRadialGradient(
      x - radius * 0.3, 
      y - radius * 0.3, 
      0, 
      x, 
      y, 
      radius
    )
    nodeGradient.addColorStop(0, color + 'FF') // Full opacity at top-left
    nodeGradient.addColorStop(1, color + 'E6') // 90% opacity at edges
    
    ctx.fillStyle = nodeGradient
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
    ctx.shadowBlur = isHovered ? 12 : 8
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 2
    
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()

    // Reset shadow for stroke
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0

    // White border with subtle inner glow
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)'
    ctx.lineWidth = isHovered ? 3 : 2
    ctx.stroke()

    // Inner highlight for 3D effect
    const highlightGradient = ctx.createRadialGradient(
      x - radius * 0.4,
      y - radius * 0.4,
      0,
      x,
      y,
      radius * 0.8
    )
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)')
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    
    ctx.fillStyle = highlightGradient
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()

    // Active pulse ring
    if (isHovered) {
      ctx.strokeStyle = color + '80' // 50% opacity
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(x, y, radius + 8, 0, Math.PI * 2)
      ctx.stroke()
    }

    ctx.restore()
  }

  // Draw edge function with circuit-like styling
  const drawEdge = (ctx, source, target, edge, state) => {
    const { drawProgress } = state
    const strength = edge.strength || 0.5

    // Calculate control point for bezier curve
    const dx = target.x - source.x
    const dy = target.y - source.y
    const curvature = 0.15

    const cpx = (source.x + target.x) / 2 + (-dy * curvature)
    const cpy = (source.y + target.y) / 2 + (dx * curvature)

    ctx.save()
    
    // Circuit trace styling - subtle gradient
    const gradient = ctx.createLinearGradient(source.x, source.y, target.x, target.y)
    gradient.addColorStop(0, 'rgba(200, 200, 200, 0.4)')
    gradient.addColorStop(0.5, 'rgba(220, 220, 220, 0.6)')
    gradient.addColorStop(1, 'rgba(200, 200, 200, 0.4)')
    
    ctx.strokeStyle = gradient
    ctx.lineWidth = 2 + (strength * 0.5)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Subtle glow for circuit effect
    ctx.shadowColor = 'rgba(255, 255, 255, 0.3)'
    ctx.shadowBlur = 3

    ctx.beginPath()
    ctx.moveTo(source.x, source.y)
    
    if (drawProgress < 1) {
      // Animate along the curve
      const t = drawProgress
      const curveX = (1 - t) * (1 - t) * source.x + 2 * (1 - t) * t * cpx + t * t * target.x
      const curveY = (1 - t) * (1 - t) * source.y + 2 * (1 - t) * t * cpy + t * t * target.y
      ctx.quadraticCurveTo(
        source.x + (cpx - source.x) * t,
        source.y + (cpy - source.y) * t,
        curveX,
        curveY
      )
    } else {
      ctx.quadraticCurveTo(cpx, cpy, target.x, target.y)
    }
    
    ctx.stroke()
    ctx.restore()
  }

  // Update transformRef when transform state changes
  useEffect(() => {
    transformRef.current = transform
  }, [transform])

  // Mouse move handler for hover detection and dragging
  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current
    if (!canvas || !simulationRef.current) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Handle panning
    if (isDraggingRef.current) {
      const dx = x - dragStartRef.current.x
      const dy = y - dragStartRef.current.y
      
      setTransform(prev => ({
        ...prev,
        x: prev.x + dx,
        y: prev.y + dy
      }))
      
      dragStartRef.current = { x, y }
      canvas.style.cursor = 'grabbing'
      return
    }

    mouseRef.current = { x, y }

    // Transform mouse coordinates to world space
    const worldX = (x - transformRef.current.x) / transformRef.current.scale
    const worldY = (y - transformRef.current.y) / transformRef.current.scale

    // Find hovered node
    const simNodes = simulationRef.current.nodes()
    let foundNode = null

    for (const node of simNodes) {
      const dx = worldX - node.x
      const dy = worldY - node.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      const nodeState = nodeStateRef.current.get(node.id) || { scale: 1 }
      const radius = 24 * (node.confidence || 1) * nodeState.scale

      if (distance <= radius) {
        foundNode = node
        break
      }
    }

    // Handle hover state changes
    if (foundNode && foundNode.id !== hoveredNodeRef.current?.id) {
      // New node hovered
      const state = nodeStateRef.current.get(foundNode.id)
      if (state) {
        anime({
          targets: state,
          hoverScale: 1.25,
          duration: 200,
          easing: 'easeOutQuad'
        })
      }
      hoveredNodeRef.current = foundNode
      canvas.style.cursor = 'pointer'
      
      if (onNodeHover) {
        onNodeHover(foundNode, true)
      }
    } else if (!foundNode && hoveredNodeRef.current) {
      // No longer hovering
      const state = nodeStateRef.current.get(hoveredNodeRef.current.id)
      if (state) {
        anime({
          targets: state,
          hoverScale: 1.0,
          duration: 200,
          easing: 'easeOutQuad'
        })
      }
      
      if (onNodeHover) {
        onNodeHover(hoveredNodeRef.current, false)
      }
      
      hoveredNodeRef.current = null
      canvas.style.cursor = 'default'
    }
  }, [onNodeHover])

  // Mouse down handler - start dragging
  const handleMouseDown = useCallback((e) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // If clicking on a node, handle node click
    if (hoveredNodeRef.current) {
      if (onNodeClick) {
        onNodeClick(hoveredNodeRef.current)
      }
      return
    }

    // Otherwise, start panning
    isDraggingRef.current = true
    dragStartRef.current = { x, y }
    canvas.style.cursor = 'grabbing'
  }, [onNodeClick])

  // Mouse up handler - stop dragging
  const handleMouseUp = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    isDraggingRef.current = false
    if (hoveredNodeRef.current) {
      canvas.style.cursor = 'pointer'
    } else {
      canvas.style.cursor = 'grab'
    }
  }, [])

  // Mouse leave handler - stop dragging
  const handleMouseLeave = useCallback(() => {
    isDraggingRef.current = false
  }, [])

  // Wheel handler for zooming
  const handleWheel = useCallback((e) => {
    e.preventDefault()
    
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    // Zoom factor
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
    const newScale = Math.max(0.1, Math.min(5, transformRef.current.scale * zoomFactor))

    // Zoom towards mouse position
    const worldX = (mouseX - transformRef.current.x) / transformRef.current.scale
    const worldY = (mouseY - transformRef.current.y) / transformRef.current.scale

    const newX = mouseX - worldX * newScale
    const newY = mouseY - worldY * newScale

    setTransform({
      x: newX,
      y: newY,
      scale: newScale
    })
  }, [])

  return (
    <div 
      ref={containerRef}
      style={{
        width: '100%',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: '#FAFAFA'
      }}
    >
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          cursor: 'grab'
        }}
      />

      {/* Tooltip for hovered node */}
      {hoveredNodeRef.current && (
        <div
          style={{
            position: 'absolute',
            left: hoveredNodeRef.current.x * transform.scale + transform.x,
            top: hoveredNodeRef.current.y * transform.scale + transform.y - 40,
            transform: 'translateX(-50%)',
            background: '#1A1A1A',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '14px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            zIndex: 1000
          }}
        >
          {hoveredNodeRef.current.type ? 
            hoveredNodeRef.current.type.charAt(0).toUpperCase() + hoveredNodeRef.current.type.slice(1).toLowerCase() 
            : 'Analysis'} • {Math.round(hoveredNodeRef.current.confidence * 100)}% confidence
        </div>
      )}

      {/* Zoom controls */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        background: 'white',
        borderRadius: '8px',
        padding: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        zIndex: 1000
      }}>
        <button
          onClick={() => setTransform(prev => ({ 
            ...prev, 
            scale: Math.min(5, prev.scale * 1.2) 
          }))}
          style={{
            width: '32px',
            height: '32px',
            border: '1px solid #E5E5E5',
            borderRadius: '4px',
            background: 'white',
            cursor: 'pointer',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#F5F5F5'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
        >
          +
        </button>
        <button
          onClick={() => setTransform(prev => ({ 
            ...prev, 
            scale: Math.max(0.1, prev.scale / 1.2) 
          }))}
          style={{
            width: '32px',
            height: '32px',
            border: '1px solid #E5E5E5',
            borderRadius: '4px',
            background: 'white',
            cursor: 'pointer',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#F5F5F5'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
        >
          −
        </button>
        <button
          onClick={() => setTransform({ x: 0, y: 0, scale: 1 })}
          style={{
            width: '32px',
            height: '32px',
            border: '1px solid #E5E5E5',
            borderRadius: '4px',
            background: 'white',
            cursor: 'pointer',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#F5F5F5'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
          title="Reset view"
        >
          ⟲
        </button>
      </div>
    </div>
  )
}