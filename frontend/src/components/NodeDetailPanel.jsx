/**
 * NodeDetailPanel - Floating panel showing detailed node information
 * 
 * Displays node content, type, confidence, keywords, and dependencies
 * Opens on click and can be closed by clicking outside or pressing Escape
 */

import { useEffect } from 'react'
import { getNodeColor } from '../utils/nodeColors'

/**
 * NodeDetailPanel component
 * 
 * @param {object} node - Node data to display
 * @param {function} onClose - Callback when panel should close
 * @param {string} position - Panel position ('left' | 'right', default: 'right')
 */
export default function NodeDetailPanel({ node, onClose, position = 'right' }) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [onClose])

  if (!node) return null

  const color = getNodeColor(node.type)
  const confidencePercent = Math.round(node.confidence * 100)

  const panelStyle = {
    position: 'absolute',
    top: '20px',
    [position]: '20px',
    zIndex: 100,
    width: '350px',
    maxHeight: 'calc(100vh - 40px)',
    overflowY: 'auto',
    animation: 'slideIn 0.3s ease-out',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)' // Add shadow for depth without backdrop
  }

  return (
    <>
      {/* Detail Panel - No backdrop to avoid darkening the scene */}
      <div className="panel" style={panelStyle}>
        <div className="panel-title" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: `2px solid ${color}`
        }}>
          <span>🧠 Node Details</span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '1.2rem',
              cursor: 'pointer',
              padding: '0 4px',
              lineHeight: 1
            }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="panel-content">
          {/* Node Type Badge */}
          <div style={{ marginBottom: '12px' }}>
            <span 
              className={`badge badge-${node.type.toLowerCase()}`}
              style={{ 
                fontSize: '0.85rem',
                padding: '4px 12px'
              }}
            >
              {node.type}
            </span>
          </div>

          {/* Confidence Bar */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: '6px',
              fontSize: '0.85rem'
            }}>
              <span>Confidence</span>
              <span style={{ fontWeight: 'bold' }}>{confidencePercent}%</span>
            </div>
            <div style={{
              width: '100%',
              height: '6px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '0',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${confidencePercent}%`,
                height: '100%',
                background: color,
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

          {/* Node Content */}
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ 
              margin: '0 0 8px 0', 
              fontSize: '0.9rem',
              color: 'var(--text-secondary)'
            }}>
              Content
            </h4>
            <p style={{ 
              margin: 0,
              padding: '10px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '0',
              lineHeight: 1.5,
              fontSize: '0.9rem',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {node.content || 'No content available'}
            </p>
          </div>

          {/* Keywords */}
          {node.keywords && node.keywords.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '0.9rem',
                color: 'var(--text-secondary)'
              }}>
                Keywords
              </h4>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '6px' 
              }}>
                {node.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    style={{
                      padding: '4px 10px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: '0',
                      fontSize: '0.8rem',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Dependencies */}
          {node.dependencies && node.dependencies.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '0.9rem',
                color: 'var(--text-secondary)'
              }}>
                Dependencies
              </h4>
              <div style={{
                padding: '10px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '0',
                fontSize: '0.85rem'
              }}>
                {node.dependencies.map((depId, index) => (
                  <div key={index} style={{ 
                    padding: '4px 0',
                    fontFamily: 'monospace'
                  }}>
                    → {depId}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Position Info */}
          {node.position && (
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '0.9rem',
                color: 'var(--text-secondary)'
              }}>
                Position
              </h4>
              <div style={{
                padding: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '0',
                fontSize: '0.8rem',
                fontFamily: 'monospace',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '8px',
                textAlign: 'center'
              }}>
                <div>
                  <div style={{ color: 'var(--text-secondary)' }}>X</div>
                  <div>{node.position.x.toFixed(2)}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)' }}>Y</div>
                  <div>{node.position.y.toFixed(2)}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)' }}>Z</div>
                  <div>{node.position.z.toFixed(2)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Node ID */}
          <div style={{
            padding: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '0',
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            color: 'var(--text-secondary)',
            wordBreak: 'break-all'
          }}>
            ID: {node.id}
          </div>

          {/* Interaction Hint */}
          <div style={{
            marginTop: '16px',
            padding: '10px',
            background: 'rgba(78, 205, 196, 0.1)',
            borderRadius: '0',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            border: '1px solid rgba(78, 205, 196, 0.3)'
          }}>
            💡 <strong>Tip:</strong> Double-click the node to focus camera on it
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(${position === 'right' ? '20px' : '-20px'});
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}
      </style>
    </>
  )
}

