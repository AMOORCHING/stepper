/**
 * useCameraAnimation Hook
 * 
 * Provides camera animation utilities for focusing on nodes,
 * resetting camera position, and smooth transitions
 */

import { useCallback } from 'react'
import anime from 'animejs'

/**
 * Hook for camera animations and controls
 * 
 * @param {object} camera - Three.js camera ref
 * @param {object} controls - OrbitControls ref
 * @returns {object} Camera animation functions
 */
export function useCameraAnimation(camera, controls) {
  /**
   * Focus camera on a specific node position
   * Camera moves to 10 units away at 45° angle
   * 
   * @param {object} nodePosition - Target position {x, y, z}
   * @param {number} duration - Animation duration in ms (default: 1500)
   * @param {number} distance - Distance from target (default: 10)
   * @returns {object} Animation instances
   */
  const focusOnNode = useCallback((nodePosition, duration = 1500, distance = 10) => {
    if (!camera || !controls || !nodePosition) {
      console.warn('Camera, controls, or nodePosition not available')
      return null
    }

    // Calculate camera position at 45° angle from target
    const angle = Math.PI / 4 // 45 degrees
    const newCameraPos = {
      x: nodePosition.x + distance * Math.cos(angle),
      y: nodePosition.y + distance * Math.sin(angle),
      z: nodePosition.z + distance * Math.cos(angle)
    }

    // Animate camera position
    const cameraAnimation = anime({
      targets: camera.position,
      x: newCameraPos.x,
      y: newCameraPos.y,
      z: newCameraPos.z,
      duration: duration,
      easing: 'easeInOutQuad',
      autoplay: true
    })

    // Animate controls target (what camera looks at)
    const controlsAnimation = anime({
      targets: controls.target,
      x: nodePosition.x,
      y: nodePosition.y,
      z: nodePosition.z,
      duration: duration,
      easing: 'easeInOutQuad',
      autoplay: true,
      update: () => {
        controls.update()
      }
    })

    return { cameraAnimation, controlsAnimation }
  }, [camera, controls])

  /**
   * Reset camera to initial position
   * 
   * @param {object} initialPosition - Initial camera position (default: [0, 10, 30])
   * @param {object} initialTarget - Initial look-at target (default: [0, 0, 0])
   * @param {number} duration - Animation duration in ms (default: 1500)
   * @returns {object} Animation instances
   */
  const resetCamera = useCallback((
    initialPosition = { x: 0, y: 10, z: 30 },
    initialTarget = { x: 0, y: 0, z: 0 },
    duration = 1500
  ) => {
    if (!camera || !controls) {
      console.warn('Camera or controls not available')
      return null
    }

    // Animate camera back to initial position
    const cameraAnimation = anime({
      targets: camera.position,
      x: initialPosition.x,
      y: initialPosition.y,
      z: initialPosition.z,
      duration: duration,
      easing: 'easeInOutQuad',
      autoplay: true
    })

    // Animate controls target back to origin
    const controlsAnimation = anime({
      targets: controls.target,
      x: initialTarget.x,
      y: initialTarget.y,
      z: initialTarget.z,
      duration: duration,
      easing: 'easeInOutQuad',
      autoplay: true,
      update: () => {
        controls.update()
      }
    })

    return { cameraAnimation, controlsAnimation }
  }, [camera, controls])

  /**
   * Smooth camera pan to look at a position
   * 
   * @param {object} targetPosition - Position to look at {x, y, z}
   * @param {number} duration - Animation duration in ms (default: 1000)
   * @returns {object} Animation instance
   */
  const panToPosition = useCallback((targetPosition, duration = 1000) => {
    if (!controls || !targetPosition) {
      console.warn('Controls or targetPosition not available')
      return null
    }

    return anime({
      targets: controls.target,
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      duration: duration,
      easing: 'easeInOutQuad',
      autoplay: true,
      update: () => {
        controls.update()
      }
    })
  }, [controls])

  return {
    focusOnNode,
    resetCamera,
    panToPosition
  }
}

