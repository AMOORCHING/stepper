/**
 * PerformanceMonitor - FPS and performance statistics display
 * 
 * Uses Stats from @react-three/drei to show real-time performance metrics
 * Monitors FPS and can trigger automatic quality adjustments
 */

import { Stats } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useState, useRef, useEffect } from 'react'

/**
 * PerformanceMonitor Component - MUST be inside Canvas
 * Only monitors FPS, does not render any DOM elements
 * 
 * @param {boolean} show - Whether monitoring is enabled (default: true)
 * @param {function} onFPSDrop - Callback when FPS drops below threshold
 * @param {number} fpsThreshold - FPS threshold for triggering callback (default: 30)
 * @param {number} checkInterval - How often to check FPS in frames (default: 60)
 */
export default function PerformanceMonitor({ 
  show = true, 
  onFPSDrop,
  fpsThreshold = 30,
  checkInterval = 60 
}) {
  const frameCount = useRef(0)
  const lastTime = useRef(performance.now())
  const lowFPSDetected = useRef(false)
  const fpsHistory = useRef([])

  // Monitor FPS - only when enabled
  useFrame(() => {
    if (!show) return
    
    frameCount.current++

    if (frameCount.current >= checkInterval) {
      const now = performance.now()
      const deltaTime = now - lastTime.current
      const fps = Math.round((frameCount.current * 1000) / deltaTime)

      // Keep FPS history (last 10 samples)
      fpsHistory.current.push(fps)
      if (fpsHistory.current.length > 10) {
        fpsHistory.current.shift()
      }

      // Calculate average FPS
      const avgFPS = fpsHistory.current.reduce((a, b) => a + b, 0) / fpsHistory.current.length

      // Trigger callback if FPS drops below threshold
      if (avgFPS < fpsThreshold && !lowFPSDetected.current && onFPSDrop) {
        lowFPSDetected.current = true
        onFPSDrop(avgFPS)
      } else if (avgFPS >= fpsThreshold) {
        lowFPSDetected.current = false
      }

      frameCount.current = 0
      lastTime.current = now
    }
  })

  // IMPORTANT: Return null - this component must not render DOM elements inside Canvas
  return null
}

/**
 * Hook to detect device performance tier
 * Returns 'high', 'medium', or 'low' based on various indicators
 */
export function useDevicePerformance() {
  const [performanceTier, setPerformanceTier] = useState('medium')

  useEffect(() => {
    const detectPerformance = () => {
      // Check hardware concurrency (CPU cores)
      const cores = navigator.hardwareConcurrency || 2
      
      // Check device memory (in GB)
      const memory = navigator.deviceMemory || 4
      
      // Check if mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
      
      // Simple scoring system
      let score = 0
      
      if (cores >= 8) score += 3
      else if (cores >= 4) score += 2
      else score += 1
      
      if (memory >= 8) score += 3
      else if (memory >= 4) score += 2
      else score += 1
      
      if (isMobile) score -= 2
      
      // Determine tier
      if (score >= 5) {
        setPerformanceTier('high')
      } else if (score >= 3) {
        setPerformanceTier('medium')
      } else {
        setPerformanceTier('low')
      }
    }

    detectPerformance()
  }, [])

  return performanceTier
}

/**
 * Performance statistics display component (non-3D overlay)
 */
export function PerformanceStats({ show = false }) {
  const [stats, setStats] = useState({
    fps: 60,
    memory: 0,
    cores: navigator.hardwareConcurrency || 'unknown',
    deviceMemory: navigator.deviceMemory || 'unknown'
  })

  useEffect(() => {
    if (!show) return

    const interval = setInterval(() => {
      // Update memory if available
      if (performance.memory) {
        setStats(prev => ({
          ...prev,
          memory: Math.round(performance.memory.usedJSHeapSize / 1048576)
        }))
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [show])

  if (!show) return null

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      padding: '12px',
      background: 'rgba(10, 10, 15, 0.85)',
      color: '#fff',
      borderRadius: '6px',
      fontSize: '0.75rem',
      fontFamily: 'monospace',
      zIndex: 9998,
      minWidth: '150px',
      backdropFilter: 'blur(4px)',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <div style={{ marginBottom: '6px', fontWeight: 'bold', fontSize: '0.8rem' }}>
        📊 Performance
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
        <span>CPU Cores:</span>
        <span>{stats.cores}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
        <span>Device RAM:</span>
        <span>{stats.deviceMemory} GB</span>
      </div>
      {stats.memory > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>JS Heap:</span>
          <span>{stats.memory} MB</span>
        </div>
      )}
    </div>
  )
}

