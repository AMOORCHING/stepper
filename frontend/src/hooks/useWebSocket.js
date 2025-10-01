/**
 * useWebSocket Hook
 * 
 * Manages WebSocket connection to the backend for real-time thought streaming
 */

import { useEffect, useRef, useState } from 'react'

/**
 * Hook for WebSocket connection and event handling
 * 
 * @param {string} sessionId - Session ID for WebSocket connection
 * @param {function} onNewThought - Callback when new thought arrives
 * @param {function} onThinkingComplete - Callback when thinking process completes
 * @param {function} onSolutionReady - Callback when solution is ready
 * @param {function} onError - Callback when error occurs
 * @returns {object} WebSocket state and controls
 */
export function useWebSocket({
  sessionId,
  onNewThought,
  onThinkingComplete,
  onSolutionReady,
  onError
}) {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState(null)
  const wsRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const reconnectAttemptsRef = useRef(0)
  
  // Version check - v2 uses data.data instead of data.thought
  console.log('WebSocket hook version: v2.0 - using data.data')
  
  const MAX_RECONNECT_ATTEMPTS = 5
  const RECONNECT_DELAY = 2000

  useEffect(() => {
    if (!sessionId) {
      console.warn('No session ID provided, WebSocket will not connect')
      return
    }

    const connect = () => {
      try {
        // Get WebSocket URL from env or default to localhost
        const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'
        const url = `${wsUrl}/ws/${sessionId}`
        
        console.log(`Connecting to WebSocket: ${url}`)
        
        const ws = new WebSocket(url)
        wsRef.current = ws

        ws.onopen = () => {
          console.log('WebSocket connected')
          setIsConnected(true)
          setConnectionError(null)
          reconnectAttemptsRef.current = 0
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            
            // Handle different event types
            switch (data.event_type) {
              case 'new_thought':
                if (onNewThought && data.data) {
                  console.log('✓ New thought node:', data.data.id, '- type:', data.data.type)
                  onNewThought(data.data)
                } else {
                  console.error('✗ new_thought event missing data:', data)
                }
                break

              case 'thinking_complete':
                if (onThinkingComplete) {
                  onThinkingComplete(data.data)
                }
                break

              case 'solution_ready':
                if (onSolutionReady) {
                  onSolutionReady(data.data)
                }
                break

              case 'error':
                console.error('WebSocket error event:', data.data)
                if (onError) {
                  onError(data.data)
                }
                break

              default:
                console.warn('Unknown event type:', data.event_type)
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error)
          }
        }

        ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          setConnectionError('WebSocket connection error')
        }

        ws.onclose = (event) => {
          console.log('WebSocket closed:', event.code, event.reason)
          setIsConnected(false)
          wsRef.current = null

          // Attempt to reconnect if not a normal closure
          if (event.code !== 1000 && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttemptsRef.current += 1
            console.log(`Reconnecting... (attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`)
            
            reconnectTimeoutRef.current = setTimeout(() => {
              connect()
            }, RECONNECT_DELAY)
          } else if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
            setConnectionError('Max reconnection attempts reached')
          }
        }
      } catch (error) {
        console.error('Error creating WebSocket:', error)
        setConnectionError(error.message)
      }
    }

    connect()

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting')
      }
    }
  }, [sessionId, onNewThought, onThinkingComplete, onSolutionReady, onError])

  /**
   * Send a message through the WebSocket
   */
  const sendMessage = (message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket is not connected, cannot send message')
    }
  }

  /**
   * Manually close the WebSocket connection
   */
  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect')
    }
  }

  return {
    isConnected,
    connectionError,
    sendMessage,
    disconnect
  }
}

