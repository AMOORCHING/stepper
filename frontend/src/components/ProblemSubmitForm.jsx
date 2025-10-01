import { useState } from 'react'
import { Card, Button } from './ui'

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
      const response = await fetch('http://localhost:8000/api/analyze', {
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
    <Card className="max-w-3xl" padding="lg">
      <h2 className="text-2xl font-semibold text-text-primary mb-6">
        🚀 Start New Analysis
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-text-primary">
            Enter your problem or question:
          </label>
          <textarea
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="e.g., How would you design a URL shortener? Think through the architecture and tradeoffs..."
            rows={6}
            className="w-full px-3 py-3 bg-bg-primary border border-border-default rounded-md text-text-primary text-sm resize-vertical font-sans focus:outline-none focus:border-accent-primary focus:ring-3 focus:ring-accent-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          />
          <div className="text-xs text-text-secondary mt-1">
            {problem.length}/5000 characters (minimum 10)
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-accent-error/10 border border-accent-error/20 rounded-md text-accent-error text-sm">
            ⚠️ {error}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isSubmitting || problem.trim().length < 10}
          className="w-full text-base font-semibold"
        >
          {isSubmitting ? '🔄 Starting Analysis...' : '✨ Analyze Problem'}
        </Button>
      </form>

      <div className="mt-6">
        <p className="text-sm text-text-secondary mb-3">
          💡 Try these examples:
        </p>
        <div className="flex flex-col gap-2">
          {exampleProblems.map((example, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setProblem(example)}
              disabled={isSubmitting}
              className="p-3 text-left text-sm bg-bg-secondary border border-border-default rounded-md text-text-secondary hover:bg-bg-tertiary hover:border-border-strong transition-all duration-fast disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 p-4 bg-accent-primary/10 border border-accent-primary/20 rounded-md text-sm">
        <strong className="font-semibold">📝 How it works:</strong>
        <ol className="mt-2 ml-5 space-y-1 list-decimal">
          <li>Enter your problem or question</li>
          <li>Click "Analyze Problem"</li>
          <li>Watch Claude's thinking unfold in real-time!</li>
        </ol>
      </div>
    </Card>
  )
}
