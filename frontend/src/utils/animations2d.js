/**
 * 2D Animation Utilities
 * Simple animations for 2D SVG elements with minimal, brutal aesthetic
 */

import anime from 'animejs'

/**
 * Animate node appearance with simple fade-in
 * @param {React.RefObject} ref - Reference to DOM element
 * @param {number} delay - Delay in milliseconds
 */
export function animateNodeAppearance(ref, delay = 0) {
  if (!ref.current) return null

  // Set transform origin to center for proper scaling
  ref.current.style.transformOrigin = '0 0'
  ref.current.style.transformBox = 'fill-box'
  
  // Start invisible
  ref.current.style.opacity = '0'

  return anime({
    targets: ref.current,
    opacity: [0, 1],
    duration: 400,
    delay,
    easing: 'easeOutCubic'
  })
}

/**
 * Animate node pulse for active node
 * @param {React.RefObject} ref - Reference to DOM element
 */
export function animateNodePulse(ref) {
  if (!ref.current) return null

  // Use opacity pulse instead of scale to avoid transform conflicts
  return anime({
    targets: ref.current,
    opacity: [1, 0.7, 1],
    duration: 1500,
    easing: 'easeInOutQuad',
    loop: true
  })
}

/**
 * Stop node pulse animation
 * @param {object} animation - anime.js animation instance
 * @param {React.RefObject} ref - Reference to DOM element
 */
export function stopNodePulse(animation, ref) {
  if (animation) {
    animation.pause()
  }
  if (ref?.current) {
    anime({
      targets: ref.current,
      opacity: 1,
      duration: 300,
      easing: 'easeOutCubic'
    })
  }
}

/**
 * Animate edge drawing with opacity fade-in
 * @param {React.RefObject} ref - Reference to DOM element
 * @param {number} delay - Delay in milliseconds
 */
export function animateEdgeDrawing(ref, delay = 0) {
  if (!ref.current) return null

  ref.current.style.opacity = '0'

  return anime({
    targets: ref.current,
    opacity: [0, 1],
    duration: 300,
    delay,
    easing: 'easeOutCubic'
  })
}

/**
 * Animate node hover
 * @param {React.RefObject} ref - Reference to DOM element
 * @param {boolean} isHovered - Whether hovering
 */
export function animateNodeHover(ref, isHovered) {
  if (!ref.current) return null

  // Use opacity change for hover instead of scale
  return anime({
    targets: ref.current,
    opacity: isHovered ? 1 : 0.9,
    duration: 150,
    easing: 'easeOutCubic'
  })
}

