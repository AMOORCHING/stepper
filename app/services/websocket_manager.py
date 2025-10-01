from fastapi import WebSocket
from typing import Dict, List, Any
import json
from datetime import datetime
from app.models.thought_node import WebSocketEvent


class WebSocketManager:
    """
    Manages WebSocket connections and broadcasts events to clients.
    """
    
    def __init__(self):
        """Initialize the WebSocket manager with empty connection tracking."""
        # Dictionary mapping session_id to list of active WebSocket connections
        self.active_connections: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, session_id: str, websocket: WebSocket):
        """
        Register a new WebSocket connection for a session.
        
        Args:
            session_id: Session identifier
            websocket: WebSocket connection to register
        """
        await websocket.accept()
        
        if session_id not in self.active_connections:
            self.active_connections[session_id] = []
        
        self.active_connections[session_id].append(websocket)
        
        # Send connection confirmation
        await self.send_personal_message(
            websocket,
            {
                "event_type": "connected",
                "session_id": session_id,
                "message": "Connected to thinking stream",
                "timestamp": datetime.utcnow().isoformat()
            }
        )
    
    async def disconnect(self, session_id: str, websocket: WebSocket):
        """
        Remove a WebSocket connection from tracking.
        
        Args:
            session_id: Session identifier
            websocket: WebSocket connection to remove
        """
        if session_id in self.active_connections:
            if websocket in self.active_connections[session_id]:
                self.active_connections[session_id].remove(websocket)
            
            # Clean up empty session lists
            if not self.active_connections[session_id]:
                del self.active_connections[session_id]
    
    async def send_personal_message(self, websocket: WebSocket, message: dict):
        """
        Send a message to a specific WebSocket connection.
        
        Args:
            websocket: Target WebSocket connection
            message: Message data to send
        """
        try:
            await websocket.send_json(message)
        except Exception as e:
            # Connection may have closed
            pass
    
    async def broadcast(self, session_id: str, event_type: str, data: Any):
        """
        Broadcast an event to all connections for a session.
        
        Args:
            session_id: Session identifier
            event_type: Type of event (new_thought, thinking_complete, solution_ready, error)
            data: Event payload data
        """
        if session_id not in self.active_connections:
            return
        
        # Create event message
        event = WebSocketEvent(
            event_type=event_type,
            session_id=session_id,
            data=data if isinstance(data, dict) else {"content": str(data)},
            timestamp=datetime.utcnow()
        )
        
        # Convert to dict for JSON serialization
        message = event.model_dump(mode='json')
        
        # Send to all connections for this session
        disconnected = []
        for connection in self.active_connections[session_id]:
            try:
                await connection.send_json(message)
            except Exception as e:
                # Mark for removal if connection failed
                disconnected.append(connection)
        
        # Clean up disconnected connections
        for connection in disconnected:
            await self.disconnect(session_id, connection)
    
    async def broadcast_new_thought(self, session_id: str, thought_node: dict):
        """
        Broadcast a new thought node to all session connections.
        
        Args:
            session_id: Session identifier
            thought_node: ThoughtNode data as dictionary
        """
        await self.broadcast(session_id, "new_thought", thought_node)
    
    async def broadcast_thinking_complete(self, session_id: str, summary: dict):
        """
        Broadcast thinking completion event.
        
        Args:
            session_id: Session identifier
            summary: Summary data (total_thoughts, total_tokens, duration_seconds)
        """
        await self.broadcast(session_id, "thinking_complete", summary)
    
    async def broadcast_solution_ready(self, session_id: str, solution: dict):
        """
        Broadcast solution ready event.
        
        Args:
            session_id: Session identifier
            solution: Solution data (solution_text, thinking_node_count)
        """
        await self.broadcast(session_id, "solution_ready", solution)
    
    async def broadcast_error(self, session_id: str, error_message: str, error_type: str = "general"):
        """
        Broadcast error event.
        
        Args:
            session_id: Session identifier
            error_message: Error message
            error_type: Type of error (general, api_error, parser_error, etc.)
        """
        await self.broadcast(
            session_id,
            "error",
            {
                "error_message": error_message,
                "error_type": error_type
            }
        )
    
    def get_connection_count(self, session_id: str) -> int:
        """
        Get the number of active connections for a session.
        
        Args:
            session_id: Session identifier
            
        Returns:
            Number of active connections
        """
        return len(self.active_connections.get(session_id, []))
    
    def has_connections(self, session_id: str) -> bool:
        """
        Check if a session has any active connections.
        
        Args:
            session_id: Session identifier
            
        Returns:
            True if session has active connections
        """
        return session_id in self.active_connections and len(self.active_connections[session_id]) > 0


# Global WebSocket manager instance
websocket_manager = WebSocketManager()

