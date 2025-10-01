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
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <textarea
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="e.g., How would you design a URL shortener? Think through the architecture and tradeoffs..."
            rows={6}
            className="w-full px-5 py-4 bg-white border border-gray-300 rounded-xl text-gray-900 text-base resize-vertical font-sans focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            disabled={isSubmitting}
          />
          <div className="text-sm text-gray-500 mt-2">
            {problem.length}/5000 characters (minimum 10)
          </div>
        </div>

        {error && (
          <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || problem.trim().length < 10}
          className="w-full px-8 py-4 bg-black text-white text-base font-medium rounded-lg hover:bg-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Starting Analysis...' : 'Analyze Problem'}
        </button>
      </form>

      <div className="mt-8">
        <p className="text-sm text-gray-600 mb-3 font-medium">
          Try these examples:
        </p>
        <div className="grid grid-cols-2 gap-3">
          {exampleProblems.map((example, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setProblem(example)}
              disabled={isSubmitting}
              className="p-4 text-left text-sm bg-white border border-gray-200 rounded-lg text-gray-700 hover:border-gray-300 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
