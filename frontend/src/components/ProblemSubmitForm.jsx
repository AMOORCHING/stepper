import { useState } from 'react'

/**
 * ProblemSubmitForm - Submit problems directly from the frontend
 */
export default function ProblemSubmitForm({ onSessionCreated }) {
  const [problem, setProblem] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!problem.trim() || problem.trim().length < 10) {
      setError('Problem must be at least 10 characters')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Call the analyze endpoint
      const response = await fetch('http://localhost:8001/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ problem: problem.trim() })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      console.log('Analysis started:', data)
      
      // Notify parent component with session ID
      if (onSessionCreated) {
        onSessionCreated(data.session_id)
      }
      
      // Clear form
      setProblem('')
      
    } catch (err) {
      console.error('Failed to submit problem:', err)
      setError(`Failed to start analysis: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const exampleProblems = [
    "How would you implement a function to reverse a linked list? Explain step by step.",
    "Design a LRU cache with O(1) operations. Walk through your reasoning.",
    "Find the longest palindromic substring. Think through different approaches.",
    "Implement merge sort and explain the divide-and-conquer strategy.",
  ]

  return (
    <div className="panel" style={{ maxWidth: '800px' }}>
      <div className="panel-title">🚀 Start New Analysis</div>
      <div className="panel-content">
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              color: 'var(--text-primary)',
              fontSize: '0.9rem'
            }}>
              Enter your problem or question:
            </label>
            <textarea
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="e.g., How would you design a URL shortener? Think through the architecture and tradeoffs..."
              rows={6}
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--bg-primary)',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
              disabled={isSubmitting}
            />
            <div style={{ 
              fontSize: '0.75rem', 
              color: 'var(--text-secondary)',
              marginTop: '4px'
            }}>
              {problem.length}/5000 characters (minimum 10)
            </div>
          </div>

          {error && (
            <div style={{
              padding: '10px',
              background: 'rgba(255, 107, 107, 0.1)',
              border: '1px solid rgba(255, 107, 107, 0.3)',
              borderRadius: '4px',
              color: '#FF6B6B',
              marginBottom: '12px',
              fontSize: '0.85rem'
            }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || problem.trim().length < 10}
            style={{
              width: '100%',
              padding: '12px 24px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: isSubmitting ? 'wait' : 'pointer'
            }}
          >
            {isSubmitting ? '🔄 Starting Analysis...' : '✨ Analyze Problem'}
          </button>
        </form>

        <div style={{ marginTop: '16px' }}>
          <p style={{ 
            fontSize: '0.85rem', 
            color: 'var(--text-secondary)',
            marginBottom: '8px'
          }}>
            💡 Try these examples:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {exampleProblems.map((example, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setProblem(example)}
                disabled={isSubmitting}
                style={{
                  padding: '8px 12px',
                  textAlign: 'left',
                  fontSize: '0.8rem',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: 'rgba(78, 205, 196, 0.1)',
          borderRadius: '4px',
          fontSize: '0.85rem',
          border: '1px solid rgba(78, 205, 196, 0.2)'
        }}>
          <strong>📝 How it works:</strong>
          <ol style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
            <li>Enter your problem or question</li>
            <li>Click "Analyze Problem"</li>
            <li>Watch Claude's thinking unfold in real-time 3D!</li>
          </ol>
        </div>
      </div>
    </div>
  )
}