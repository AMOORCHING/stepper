import { useEffect, useRef } from 'react'
import anime from 'animejs'

/**
 * MetricsPanel - Displays real-time thinking metrics
 * Following PRD specifications with animated counters
 */
export function MetricsPanel({ 
  thinkingTime = 0,
  nodeCount = 0,
  thinkingTokens = 0,
  avgConfidence = 0
}) {
  const timeRef = useRef(null)
  const countRef = useRef(null)
  const tokensRef = useRef(null)
  const confidenceRef = useRef(null)

  // Animate counter updates
  useEffect(() => {
    if (countRef.current) {
      const counter = { value: parseInt(countRef.current.textContent) || 0 }
      anime({
        targets: counter,
        value: nodeCount,
        duration: 500,
        easing: 'easeOutQuad',
        round: 1,
        update: () => {
          if (countRef.current) {
            countRef.current.textContent = counter.value
          }
        }
      })
    }
  }, [nodeCount])

  useEffect(() => {
    if (tokensRef.current) {
      const counter = { value: parseInt(tokensRef.current.textContent.replace(/,/g, '')) || 0 }
      anime({
        targets: counter,
        value: thinkingTokens,
        duration: 500,
        easing: 'easeOutQuad',
        round: 1,
        update: () => {
          if (tokensRef.current) {
            tokensRef.current.textContent = counter.value.toLocaleString()
          }
        }
      })
    }
  }, [thinkingTokens])

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px',
      background: '#F5F5F5',
      border: '1px solid #E5E5E5',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '24px'
    }}>
      <Metric
        label="Thinking Time"
        value={formatDuration(thinkingTime)}
        valueRef={timeRef}
      />
      <Metric
        label="Total Thoughts"
        value={nodeCount}
        valueRef={countRef}
      />
      <Metric
        label="Tokens Used"
        value={thinkingTokens.toLocaleString()}
        valueRef={tokensRef}
      />
      <Metric
        label="Avg. Confidence"
        value={`${Math.round(avgConfidence * 100)}%`}
        valueRef={confidenceRef}
      />
    </div>
  )
}

function Metric({ label, value, valueRef }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontSize: '10px',
        fontWeight: '500',
        color: '#737373',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '4px'
      }}>
        {label}
      </div>
      <div
        ref={valueRef}
        style={{
          fontSize: '24px',
          fontWeight: '600',
          color: '#1A1A1A',
          fontVariantNumeric: 'tabular-nums'
        }}
      >
        {value}
      </div>
    </div>
  )
}

/**
 * Legend - Shows thought type color coding
 * Following PRD specifications
 */
export function Legend() {
    const nodeTypes = {
      Analysis: '#2563EB',
      Decision: '#DC2626',
      Verification: '#059669',
      Alternative: '#D97706',
      Implementation: '#7C3AED'
    }
  
    return (
      <div style={{
        position: 'absolute',
        top: '24px',
        right: '24px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        border: '1px solid #E5E5E5',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
        zIndex: 10
      }}>
        <h4 style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#1A1A1A',
          marginBottom: '12px',
          margin: 0
        }}>
          Thought Types
        </h4>
        {Object.entries(nodeTypes).map(([type, color]) => (
          <div
            key={type}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}
          >
            <span
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: color,
                border: '2px solid white',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                flexShrink: 0
              }}
            />
            <span style={{
              fontSize: '14px',
              color: '#4A4A4A',
              textTransform: 'capitalize'
            }}>
              {type}
            </span>
          </div>
        ))}
      </div>
    )
  }
  
  /**
   * ControlPanel - Visualization controls
   */
  export function ControlPanel({ onReset, onPauseSimulation, isPaused }) {
    return (
      <div style={{
        position: 'absolute',
        bottom: '24px',
        left: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 10
      }}>
        <button
          onClick={onReset}
          style={{
            width: '48px',
            height: '48px',
            background: '#F5F5F5',
            border: '2px solid #D4D4D4',
            borderRadius: '8px',
            color: '#1A1A1A',
            cursor: 'pointer',
            fontSize: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 150ms',
            ':hover': {
              borderColor: '#A3A3A3',
              background: '#FFFFFF'
            }
          }}
          title="Reset View"
        >
          ⟲
        </button>
        <button
          onClick={onPauseSimulation}
          style={{
            width: '48px',
            height: '48px',
            background: '#F5F5F5',
            border: '2px solid #D4D4D4',
            borderRadius: '8px',
            color: '#1A1A1A',
            cursor: 'pointer',
            fontSize: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 150ms'
          }}
          title={isPaused ? 'Resume Simulation' : 'Pause Simulation'}
        >
          {isPaused ? '▶' : '⏸'}
        </button>
      </div>
    )
  }
  
  /**
   * Helper function to format duration
   */
  function formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`
    const seconds = Math.floor(ms / 1000)
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }