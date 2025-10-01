import { useState, useEffect } from 'react'
import ThinkingScene2D from './components/ThinkingScene2D'
import NodeDetailPanel from './components/NodeDetailPanel'
import { useThinkingStore } from './store/thinkingStore'
import { useWebSocket } from './hooks/useWebSocket'
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import { Legend } from './components/MetricsPanel'

// Test data - D3 will calculate positions automatically
const testNodes = [
  { id: 'node1', type: 'Analysis', confidence: 0.8, content: 'Initial analysis of the problem' },
  { id: 'node2', type: 'Decision', confidence: 0.9, content: 'Decision point: choose approach A' },
  { id: 'node3', type: 'Alternative', confidence: 0.6, content: 'Alternative approach B' },
  { id: 'node4', type: 'Verification', confidence: 1.0, content: 'Verify solution correctness' },
  { id: 'node5', type: 'Implementation', confidence: 0.7, content: 'Implement final solution' }
]

const testEdges = [
  { from: 'node1', to: 'node2', relationshipType: 'logical', strength: 0.8 },
  { from: 'node1', to: 'node3', relationshipType: 'alternative', strength: 0.5 },
  { from: 'node2', to: 'node4', relationshipType: 'temporal', strength: 0.7 },
  { from: 'node3', to: 'node4', relationshipType: 'temporal', strength: 0.6 },
  { from: 'node4', to: 'node5', relationshipType: 'logical', strength: 0.9 }
]

function App() {
  const [showScene, setShowScene] = useState(false)
  const [nodeCount, setNodeCount] = useState(0)
  const [useWebSocketMode, setUseWebSocketMode] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [selectedNode, setSelectedNode] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Problem submission state
  const [problem, setProblem] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  
  // Zustand store
  const {
    nodes: storeNodes,
    edges: storeEdges,
    isThinking,
    isComplete,
    error,
    enqueueNode,
    setComplete,
    setError,
    reset: resetStore,
    animationDelay,
    setAnimationDelay
  } = useThinkingStore()
  
  // WebSocket integration
  const { isConnected, connectionError } = useWebSocket({
    sessionId: useWebSocketMode ? sessionId : null,
    onNewThought: (thought) => {
      console.log('Enqueueing node from WebSocket:', thought?.id)
      enqueueNode(thought)
    },
    onThinkingComplete: (data) => {
      console.log('Thinking complete:', data)
      setComplete(true)
    },
    onSolutionReady: (solution) => {
      console.log('Solution ready:', solution)
    },
    onError: (err) => {
      console.error('WebSocket error:', err)
      setError(err)
    }
  })
  
  // Get nodes/edges to display
  const displayNodes = useWebSocketMode 
    ? storeNodes 
    : testNodes.slice(0, nodeCount)
  
  const displayEdges = useWebSocketMode 
    ? storeEdges 
    : testEdges.filter(edge => {
        const hasFrom = displayNodes.some(n => n.id === edge.from)
        const hasTo = displayNodes.some(n => n.id === edge.to)
        return hasFrom && hasTo
      })
  
  // Simulate nodes appearing over time (demo mode only)
  useEffect(() => {
    if (useWebSocketMode || !showScene) {
      setNodeCount(0)
      return
    }
    
    const timer = setTimeout(() => {
      if (nodeCount < testNodes.length) {
        setNodeCount(prev => prev + 1)
      }
    }, nodeCount === 0 ? 800 : 900)
    
    return () => clearTimeout(timer)
  }, [showScene, nodeCount, useWebSocketMode])
  
  // Reset store when switching modes
  useEffect(() => {
    if (useWebSocketMode) {
      resetStore()
    }
  }, [useWebSocketMode, resetStore])
  
  // Handle node click
  const handleNodeClick = (node) => {
    console.log('Node clicked:', node)
    setSelectedNode(node)
  }
  
  // Handle node hover
  const handleNodeHover = (node, isHovering) => {
    // Optional: add hover effects
  }
  
  // Loading state
  useEffect(() => {
    if (showScene) {
      setIsLoading(true)
      const timer = setTimeout(() => setIsLoading(false), 800)
      return () => clearTimeout(timer)
    }
  }, [showScene])
  
  // Handle problem submission
  const handleSubmitProblem = async (e) => {
    e.preventDefault()
    
    if (!problem.trim() || problem.trim().length < 10) {
      setSubmitError('Problem must be at least 10 characters')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem: problem.trim() })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Analysis started:', data)
      
      setSessionId(data.session_id)
      setUseWebSocketMode(true)
      setProblem('')
      
      setTimeout(() => setShowScene(true), 100)
      
    } catch (err) {
      console.error('Failed to submit problem:', err)
      setSubmitError(`Failed to start analysis: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const exampleProblems = [
    {
      label: "Apples remaining",
      text: "I went to the market and bought 10 apples. I gave 2 apples to the neighbor and 2 to the repairman. I then went and bought 5 more apples and ate 1. How many apples did I remain with?\nLet's think step by step."
    },
    {
      label: "Train schedule",
      text: "A train leaves Station A at 9:00 AM traveling at 60 mph toward Station B, 180 miles away. Another train leaves Station B at 9:30 AM traveling at 80 mph toward Station A. At what time will they meet?\nLet's think step by step."
    },
    {
      label: "Age puzzle",
      text: "Sarah is twice as old as her brother was 2 years ago. In 3 years, Sarah will be 27. How old is her brother now?\nLet's think step by step."
    },
    {
      label: "Water tank",
      text: "A water tank can be filled by pipe A in 4 hours and by pipe B in 6 hours. If both pipes are opened together, how long will it take to fill the tank?\nLet's think step by step."
    },
  ]

  // ===== VISUALIZATION VIEW =====
  if (showScene) {
    return (
      <div className="flex flex-col h-screen">
        {/* <Header /> */}
        <div className="flex flex-1 overflow-hidden">
          <Sidebar>
            <section>
              <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide mb-4">
                Session Info
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-secondary">Nodes</span>
                  <span className="text-sm font-semibold text-text-primary">
                    {displayNodes.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-secondary">Edges</span>
                  <span className="text-sm font-semibold text-text-primary">
                    {displayEdges.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-secondary">Status</span>
                  <span className="text-sm font-semibold text-text-primary">
                    {isThinking ? 'Thinking...' : isComplete ? 'Complete' : 'Ready'}
                  </span>
                </div>
                {useWebSocketMode && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-secondary">Connection</span>
                    <span className={`text-sm font-semibold ${isConnected ? 'text-accent-success' : 'text-accent-error'}`}>
                      {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                )}
              </div>
            </section>

            <section className="mt-8">
              <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide mb-4">
                Animation Settings
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-text-secondary">Node Delay</span>
                    <span className="text-xs font-semibold text-text-primary">{animationDelay}ms</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="50"
                    value={animationDelay}
                    onChange={(e) => setAnimationDelay(Number(e.target.value))}
                    className="w-full h-2 bg-bg-tertiary rounded-lg appearance-none cursor-pointer accent-accent-primary"
                  />
                  <div className="flex justify-between text-xs text-text-secondary mt-1">
                    <span>Instant</span>
                    <span>Slow</span>
                  </div>
                  <p className="text-xs text-text-secondary mt-2">
                    Controls the delay between nodes appearing when receiving rapid updates
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-8">
              <button 
                onClick={() => setShowScene(false)}
                className="w-full px-4 py-2 bg-bg-secondary text-text-primary border border-border-default rounded-md text-sm font-medium hover:border-border-strong hover:bg-bg-tertiary transition-all"
              >
                ← Back to Home
              </button>
            </section>
          </Sidebar>

          <div className="relative flex-1">
            {/* Loading Spinner */}
            {isLoading && (
              <div className="fixed inset-0 flex flex-col items-center justify-center bg-bg-primary z-[10000]" 
                   style={{ animation: 'fadeOut 0.5s ease-out 1s forwards' }}>
                <div className="w-[60px] h-[60px] border-4 border-accent-primary/20 border-t-accent-primary rounded-full animate-spin" />
                <p className="mt-5 text-text-secondary">Loading Visualization...</p>
              </div>
            )}
            
            {/* Canvas Visualization */}
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <ThinkingScene2D
                nodes={displayNodes}
                edges={displayEdges}
                onNodeClick={handleNodeClick}
                onNodeHover={handleNodeHover}
              />
              
              <Legend />
              
              {selectedNode && (
                <NodeDetailPanel
                  node={selectedNode}
                  onClose={() => setSelectedNode(null)}
                  position="right"
                />
              )}

              {/* Empty State */}
              {displayNodes.length === 0 && !isLoading && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  color: '#A3A3A3',
                  maxWidth: '400px'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧠</div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#4A4A4A', marginBottom: '8px' }}>
                    No thoughts yet
                  </div>
                  <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                    {useWebSocketMode 
                      ? 'Waiting for analysis to begin...'
                      : 'Switch to WebSocket mode or wait for demo nodes to appear'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ===== HOME PAGE =====
  return (
    <main className="flex min-h-screen relative mx-4 md:mx-8 lg:mx-36 border-l border-r border-gray-200 bg-transparent">
      <div className="absolute top-8 left-8">
        <header className="text-sm text-gray-800 font-medium">
          Let's Think Step by Step
        </header>
        <header className="text-sm text-gray-500 tracking-normal">
          By <a href="https://moorching.com" className="underline underline-offset-2" target="_self">Akash Moorching</a>
        </header>
      </div>

      <div className="flex items-center justify-center w-full px-8">
        <div className="max-w-2xl w-full text-left">
          <p className="text-gray-800 text-sm leading-relaxed mb-8">
            Inspired by <a
              href="https://www.anthropic.com/research/tracing-thoughts-language-model"
              className="underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >Anthropic's circuit tracing research</a> on how language models think, <span className="font-bold text-gray-900">Stepper</span> renders Claude 4.5's internal reasoning chain as an interactive force-directed graph. Watch as thought nodes emerge in real-time: analytical steps, decision points, verification checks, and alternative approaches Claude considers and discards.
            <br /><br />
            Submit a reasoning problem, word puzzle, math challenge, or logical question below. Each node represents a distinct reasoning step—hover to read the full thought, click to explore dependencies, and trace the logical pathway from problem to solution.
          </p>

          <form onSubmit={handleSubmitProblem} className="mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {exampleProblems.map((example, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setProblem(example.text)}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {example.label}
                </button>
              ))}
            </div>

            <textarea
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="Describe your problem... (e.g., If I have 5 red balls and 3 blue balls, and I give away 2 red balls, how many balls do I have left?)"
              rows={4}
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 text-sm resize-vertical focus:outline-none focus:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed mb-3"
            />
            
            {submitError && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
                {submitError}
              </div>
            )}
            
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-gray-500">
                {problem.length}/5000 characters (minimum 10)
              </div>
              <button 
                type="submit"
                disabled={isSubmitting || problem.trim().length < 10}
                className="px-6 py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Analyzing...' : 'Start Analysis'}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                setUseWebSocketMode(false)
                setShowScene(true)
              }}
              className="text-gray-600 hover:text-gray-800 text-sm flex items-center gap-2 transition-all duration-200 hover:translate-x-1"
            >
              View demo visualization
              <span className="inline-block">→</span>
            </button>
          </div>
        </div>
      </div>

      <nav className="absolute bottom-8 right-8 flex flex-col gap-4 items-end">
        <a
          href="https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking"
          className="text-gray-600 hover:text-gray-800 text-sm flex items-center gap-2 transition-all duration-200 hover:translate-x-1"
          target="_blank"
          rel="noopener noreferrer"
        >
          Docs
          <span className="inline-block">↗</span>
        </a>
        <a
          href="https://github.com/AMOORCHING/stepper"
          className="text-gray-600 hover:text-gray-800 text-sm flex items-center gap-2 transition-all duration-200 hover:translate-x-1"
          target="_blank"
          rel="noopener noreferrer"
        >
          Github
          <span className="inline-block">↗</span>
        </a>
      </nav>
    </main>
  )
}

export default App