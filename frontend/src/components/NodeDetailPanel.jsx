/**
 * NodeDetailPanel - Floating panel showing detailed node information
 * 
 * Displays node content, type, confidence, and keywords
 * Opens on click and can be closed by clicking outside or pressing Escape
 */

import { useEffect } from 'react'
import { getNodeColor } from '../utils/nodeColors'
import { Card, Badge } from './ui'

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

  return (
    <>
      {/* Detail Panel */}
      <div 
        className={`
          fixed top-5 z-50 w-[350px] max-h-[calc(100vh-40px)] overflow-y-auto
          ${position === 'right' ? 'right-5 animate-[slideInRight_0.3s_ease-out]' : 'left-5 animate-[slideInLeft_0.3s_ease-out]'}
        `}
        style={{
          animation: position === 'right' 
            ? 'slideInRight 0.3s ease-out' 
            : 'slideInLeft 0.3s ease-out'
        }}
      >
        <Card className="shadow-lg">
          {/* Header */}
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-border-subtle">
            <h3 className="text-xl font-semibold text-text-primary">
              🧠 Node Details
            </h3>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary transition-colors text-2xl leading-none p-1"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Node Type Badge */}
          <div className="mb-4">
            <Badge variant={node.type.toLowerCase()} size="md" color={color}>
              {node.type}
            </Badge>
          </div>

          {/* Confidence Bar */}
          <div className="mb-6">
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-text-secondary">Confidence</span>
              <span className="font-semibold text-text-primary">{confidencePercent}%</span>
            </div>
            <div className="w-full h-2 bg-bg-tertiary rounded-sm overflow-hidden">
              <div 
                className="h-full transition-all duration-normal"
                style={{
                  width: `${confidencePercent}%`,
                  backgroundColor: color
                }}
              />
            </div>
          </div>

          {/* Node Content */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-text-secondary mb-2">
              Content
            </h4>
            <p className="m-0 p-3 bg-bg-tertiary rounded-sm text-sm leading-normal whitespace-pre-wrap break-words">
              {node.content || 'No content available'}
            </p>
          </div>

          {/* Keywords */}
          {node.keywords && node.keywords.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-text-secondary mb-2">
                Keywords
              </h4>
              <div className="flex flex-wrap gap-2">
                {node.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-2.5 py-1 bg-bg-tertiary border border-border-subtle rounded-sm text-xs"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  )
}
