import { useRef, useState, useEffect } from 'react'

/**
 * ThinkingScene2D - Main 2D visualization component for thought nodes
 * 
 * This component sets up an SVG canvas with:
 * - Pan and zoom controls
 * - Clean, minimal styling
 * - No rotation or 3D effects
 * 
 * @param {ReactNode} children - Child components to render in the scene
 * @param {function} onReady - Callback when scene is ready
 */
export default function ThinkingScene2D({ 
  children,
  onReady
}) {
  const svgRef = useRef()
  const containerRef = useRef()
  // Center viewBox around where nodes will be (around x=1000, y starts at 100)
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 2000, height: 1500 })
  const [isPanning, setIsPanning] = useState(false)
  const [startPan, setStartPan] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  
  // Notify parent when scene is ready
  useEffect(() => {
    if (svgRef.current && onReady) {
      onReady({
        resetView: () => {
          setViewBox({ x: 0, y: 0, width: 2000, height: 1500 })
          setScale(1)
        },
        focusOnNode: (position) => {
          // Center view on node
          const newViewBox = {
            x: position.x - 500,
            y: position.y - 375,
            width: 1000,
            height: 750
          }
          setViewBox(newViewBox)
        }
      })
    }
  }, [onReady])
  
  // Handle mouse wheel for zoom
  const handleWheel = (e) => {
    e.preventDefault()
    
    const delta = e.deltaY > 0 ? 1.1 : 0.9
    const newScale = Math.min(Math.max(scale * delta, 0.5), 3)
    
    setScale(newScale)
    
    // Adjust viewBox for zoom
    const rect = svgRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    
    const svgX = viewBox.x + (mouseX / rect.width) * viewBox.width
    const svgY = viewBox.y + (mouseY / rect.height) * viewBox.height
    
    const newWidth = 2000 / newScale
    const newHeight = 1500 / newScale
    
    setViewBox({
      x: svgX - (mouseX / rect.width) * newWidth,
      y: svgY - (mouseY / rect.height) * newHeight,
      width: newWidth,
      height: newHeight
    })
  }
  
  // Handle mouse down for panning
  const handleMouseDown = (e) => {
    if (e.button !== 0) return // Only left click
    setIsPanning(true)
    setStartPan({ x: e.clientX, y: e.clientY })
  }
  
  // Handle mouse move for panning
  const handleMouseMove = (e) => {
    if (!isPanning) return
    
    const rect = svgRef.current.getBoundingClientRect()
    const dx = (startPan.x - e.clientX) * (viewBox.width / rect.width)
    const dy = (startPan.y - e.clientY) * (viewBox.height / rect.height)
    
    setViewBox(prev => ({
      ...prev,
      x: prev.x + dx,
      y: prev.y + dy
    }))
    
    setStartPan({ x: e.clientX, y: e.clientY })
  }
  
  // Handle mouse up to stop panning
  const handleMouseUp = () => {
    setIsPanning(false)
  }
  
  return (
    <div 
      ref={containerRef}
      style={{ 
        width: '100%', 
        height: '100vh', 
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--bg-primary)',
        cursor: isPanning ? 'grabbing' : 'grab'
      }}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          display: 'block'
        }}
      >
        {/* Grid pattern for reference - minimal */}
        <defs>
          <pattern 
            id="grid" 
            width="100" 
            height="100" 
            patternUnits="userSpaceOnUse"
          >
            <path 
              d="M 100 0 L 0 0 0 100" 
              fill="none" 
              stroke="rgba(255,255,255,0.03)" 
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Child components (nodes, edges, etc.) will render here */}
        {children}
      </svg>
      
      {/* Zoom controls */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 10
      }}>
        <button
          onClick={() => {
            const newScale = Math.min(scale * 1.2, 3)
            setScale(newScale)
            setViewBox(prev => ({
              ...prev,
              width: 2000 / newScale,
              height: 1500 / newScale
            }))
          }}
          style={{
            width: '40px',
            height: '40px',
            padding: 0,
            fontSize: '20px',
            background: 'var(--bg-secondary)',
            border: '2px solid var(--color-border)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          +
        </button>
        <button
          onClick={() => {
            const newScale = Math.max(scale * 0.8, 0.5)
            setScale(newScale)
            setViewBox(prev => ({
              ...prev,
              width: 2000 / newScale,
              height: 1500 / newScale
            }))
          }}
          style={{
            width: '40px',
            height: '40px',
            padding: 0,
            fontSize: '20px',
            background: 'var(--bg-secondary)',
            border: '2px solid var(--color-border)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          −
        </button>
        <button
          onClick={() => {
            setViewBox({ x: 0, y: 0, width: 2000, height: 1500 })
            setScale(1)
          }}
          style={{
            width: '40px',
            height: '40px',
            padding: 0,
            fontSize: '16px',
            background: 'var(--bg-secondary)',
            border: '2px solid var(--color-border)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ⟲
        </button>
      </div>
    </div>
  )
}

