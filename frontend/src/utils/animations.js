/**
 * Animation System using anime.js
 * 
 * Provides animation helpers for node appearances, pulses, and edge drawing
 */

import anime from 'animejs'

/**
 * Animate node appearance with elastic bounce effect
 * Scale from [0,0,0] to [1,1,1] over 800ms
 * 
 * @param {object} meshRef - React ref to the Three.js mesh
 * @param {number} delay - Optional delay before animation starts (ms)
 * @returns {object} Anime.js animation instance
 */
export function animateNodeAppearance(meshRef, delay = 0) {
  if (!meshRef.current) return null
  
  // Set initial scale to 0
  meshRef.current.scale.set(0, 0, 0)
  
  return anime({
    targets: meshRef.current.scale,
    x: 1,
    y: 1,
    z: 1,
    duration: 800,
    delay: delay,
    easing: 'easeOutElastic(1, 0.8)',
    autoplay: true
  })
}

/**
 * Animate node pulsing effect
 * Oscillates emissive intensity between 0.5 and 1.0
 * 
 * @param {object} meshRef - React ref to the Three.js mesh
 * @param {number} baseIntensity - Base emissive intensity (default: 0.5)
 * @returns {object} Anime.js animation instance
 */
export function animateNodePulse(meshRef, baseIntensity = 0.5) {
  if (!meshRef.current || !meshRef.current.material) return null
  
  const material = meshRef.current.material
  
  return anime({
    targets: material,
    emissiveIntensity: [baseIntensity, 1.0],
    duration: 2000,
    easing: 'easeInOutSine',
    loop: true,
    direction: 'alternate',
    autoplay: true
  })
}

/**
 * Stop pulse animation and reset to base intensity
 * 
 * @param {object} animation - Anime.js animation instance
 * @param {object} meshRef - React ref to the mesh
 * @param {number} baseIntensity - Intensity to reset to
 */
export function stopNodePulse(animation, meshRef, baseIntensity = 0.5) {
  if (animation) {
    animation.pause()
  }
  
  if (meshRef.current && meshRef.current.material) {
    meshRef.current.material.emissiveIntensity = baseIntensity
  }
}

/**
 * Animate edge drawing effect
 * Creates a line that appears to draw from start to end
 * 
 * Note: Three.js Line component doesn't support dashOffset animation directly,
 * so we animate opacity instead for a fade-in effect
 * 
 * @param {object} lineRef - React ref to the Line component
 * @param {number} delay - Optional delay before animation starts (ms)
 * @returns {object} Anime.js animation instance
 */
export function animateEdgeDrawing(lineRef, delay = 0) {
  if (!lineRef.current) return null
  
  // Start with opacity 0
  const initialOpacity = lineRef.current.material?.opacity || 0
  if (lineRef.current.material) {
    lineRef.current.material.opacity = 0
  }
  
  return anime({
    targets: lineRef.current.material,
    opacity: initialOpacity > 0 ? initialOpacity : 0.6,
    duration: 500,
    delay: delay,
    easing: 'easeOutQuad',
    autoplay: true
  })
}

/**
 * Calculate stagger delay for sequential animations
 * 
 * @param {number} index - Index of the element in sequence
 * @param {number} staggerDelay - Delay between each element (ms, default: 100)
 * @returns {number} Total delay in milliseconds
 */
export function calculateStaggerDelay(index, staggerDelay = 100) {
  return index * staggerDelay
}

/**
 * Animate camera focus on a specific node
 * Smooth transition to look at target position
 * 
 * @param {object} camera - Three.js camera object
 * @param {object} controls - OrbitControls instance
 * @param {object} targetPosition - Target {x, y, z} position
 * @param {number} distance - Distance from target (default: 10)
 * @param {number} duration - Animation duration (ms, default: 1500)
 * @returns {object} Anime.js animation instance
 */
export function animateCameraFocus(camera, controls, targetPosition, distance = 10, duration = 1500) {
  if (!camera || !controls || !targetPosition) return null
  
  // Calculate camera position at 45° angle from target
  const angle = Math.PI / 4 // 45 degrees
  const newCameraPos = {
    x: targetPosition.x + distance * Math.cos(angle),
    y: targetPosition.y + distance * Math.sin(angle),
    z: targetPosition.z + distance * Math.cos(angle)
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
  
  // Animate controls target
  const controlsAnimation = anime({
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
  
  return { cameraAnimation, controlsAnimation }
}

/**
 * Animate node scale on hover
 * 
 * @param {object} meshRef - React ref to the mesh
 * @param {number} targetScale - Target scale value
 * @param {number} duration - Animation duration (ms, default: 200)
 * @returns {object} Anime.js animation instance
 */
export function animateNodeHover(meshRef, targetScale, duration = 200) {
  if (!meshRef.current) return null
  
  return anime({
    targets: meshRef.current.scale,
    x: targetScale,
    y: targetScale,
    z: targetScale,
    duration: duration,
    easing: 'easeOutQuad',
    autoplay: true
  })
}

/**
 * Group animation helper - animate multiple nodes with stagger
 * 
 * @param {Array} meshRefs - Array of mesh refs
 * @param {number} staggerDelay - Delay between each node (ms)
 * @returns {Array} Array of animation instances
 */
export function animateNodesWithStagger(meshRefs, staggerDelay = 100) {
  return meshRefs.map((ref, index) => {
    return animateNodeAppearance(ref, calculateStaggerDelay(index, staggerDelay))
  })
}

