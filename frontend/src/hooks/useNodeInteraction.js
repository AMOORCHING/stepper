/**
 * useNodeInteraction Hook
 * 
 * Provides raycasting and interaction utilities for detecting
 * hover and click events on 3D nodes
 */

import { useState, useCallback, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Raycaster, Vector2 } from 'three'

/**
 * Hook for managing node interactions (hover, click, double-click)
 * Uses raycasting to detect mouse interactions with 3D nodes
 * 
 * @returns {object} Interaction state and handlers
 */
export function useNodeInteraction() {
  const { camera, gl, scene } = useThree()
  const raycaster = useRef(new Raycaster()).current
  const mouse = useRef(new Vector2()).current
  
  const [hoveredNode, setHoveredNode] = useState(null)
  const [clickedNode, setClickedNode] = useState(null)
  const lastClickTime = useRef(0)
  const lastClickedNode = useRef(null)

  /**
   * Update mouse position in normalized device coordinates (-1 to +1)
   */
  const updateMousePosition = useCallback((event) => {
    const rect = gl.domElement.getBoundingClientRect()
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  }, [gl, mouse])

  /**
   * Perform raycasting to detect intersections with nodes
   * 
   * @param {Vector2} mousePosition - Mouse position in NDC
   * @returns {object|null} Intersected node mesh or null
   */
  const raycast = useCallback((mousePosition) => {
    if (!camera || !scene) return null
    
    raycaster.setFromCamera(mousePosition, camera)
    
    // Find all meshes in the scene (nodes)
    const meshes = []
    scene.traverse((object) => {
      if (object.isMesh && object.userData.isNode) {
        meshes.push(object)
      }
    })
    
    const intersects = raycaster.intersectObjects(meshes, false)
    
    return intersects.length > 0 ? intersects[0] : null
  }, [camera, scene, raycaster])

  /**
   * Handle mouse move for hover detection
   */
  const handleMouseMove = useCallback((event) => {
    updateMousePosition(event)
    const intersection = raycast(mouse)
    
    if (intersection) {
      const nodeData = intersection.object.userData.nodeData
      setHoveredNode(nodeData)
      document.body.style.cursor = 'pointer'
    } else {
      if (hoveredNode) {
        setHoveredNode(null)
        document.body.style.cursor = 'default'
      }
    }
  }, [updateMousePosition, raycast, mouse, hoveredNode])

  /**
   * Handle click on nodes
   * Detects both single-click and double-click
   * 
   * @param {Function} onSingleClick - Callback for single click
   * @param {Function} onDoubleClick - Callback for double click
   */
  const handleClick = useCallback((event, onSingleClick, onDoubleClick) => {
    updateMousePosition(event)
    const intersection = raycast(mouse)
    
    if (intersection) {
      const nodeData = intersection.object.userData.nodeData
      const currentTime = Date.now()
      const timeSinceLastClick = currentTime - lastClickTime.current
      
      // Detect double-click (within 300ms)
      if (
        timeSinceLastClick < 300 && 
        lastClickedNode.current?.id === nodeData?.id
      ) {
        // Double-click detected
        if (onDoubleClick) {
          onDoubleClick(nodeData)
        }
        lastClickTime.current = 0
        lastClickedNode.current = null
      } else {
        // Single click
        setClickedNode(nodeData)
        if (onSingleClick) {
          onSingleClick(nodeData)
        }
        lastClickTime.current = currentTime
        lastClickedNode.current = nodeData
      }
    } else {
      // Click on empty space - clear selection
      setClickedNode(null)
      if (onSingleClick) {
        onSingleClick(null)
      }
    }
  }, [updateMousePosition, raycast, mouse])

  /**
   * Clear hover state
   */
  const clearHover = useCallback(() => {
    setHoveredNode(null)
    document.body.style.cursor = 'default'
  }, [])

  /**
   * Clear click state
   */
  const clearClick = useCallback(() => {
    setClickedNode(null)
  }, [])

  return {
    hoveredNode,
    clickedNode,
    handleMouseMove,
    handleClick,
    clearHover,
    clearClick,
    raycast
  }
}

