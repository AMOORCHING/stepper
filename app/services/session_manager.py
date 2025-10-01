import uuid
from typing import Dict, Optional, List, Any
from datetime import datetime, timedelta
from collections import defaultdict
from app.config import settings


class Session:
    """Represents an analysis session."""
    
    def __init__(self, session_id: str, ip_address: str):
        self.session_id = session_id
        self.ip_address = ip_address
        self.status = "initializing"  # initializing, streaming, completed, error
        self.created_at = datetime.utcnow()
        self.thought_nodes: List[dict] = []
        self.tokens_used = 0
        self.problem_text = ""
        self.solution_text = ""
        self.error_message: Optional[str] = None
    
    def to_dict(self) -> dict:
        """Convert session to dictionary."""
        return {
            "session_id": self.session_id,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
            "thought_count": len(self.thought_nodes),
            "tokens_used": self.tokens_used,
            "problem_text": self.problem_text[:100] + "..." if len(self.problem_text) > 100 else self.problem_text,
            "has_solution": bool(self.solution_text),
            "error_message": self.error_message
        }


class SessionManager:
    """
    Manages analysis sessions with rate limiting and automatic cleanup.
    """
    
    def __init__(self):
        """Initialize session manager with empty storage."""
        # Session storage: session_id -> Session
        self.sessions: Dict[str, Session] = {}
        
        # IP tracking for rate limiting: ip_address -> list of active session_ids
        self.ip_sessions: Dict[str, List[str]] = defaultdict(list)
        
        # Configuration from settings
        self.max_concurrent_per_ip = settings.max_concurrent_sessions_per_ip
        self.cleanup_hours = settings.session_cleanup_hours
    
    def generate_session_id(self) -> str:
        """
        Generate a unique session identifier.
        
        Returns:
            Unique UUID4-based session ID
        """
        return f"session_{uuid.uuid4().hex[:16]}"
    
    def create_session(self, ip_address: str) -> Session:
        """
        Create a new session with rate limiting check.
        
        Args:
            ip_address: Client IP address
            
        Returns:
            New Session object
            
        Raises:
            Exception: If rate limit exceeded
        """
        # Check rate limit
        active_sessions = self._get_active_sessions_for_ip(ip_address)
        if len(active_sessions) >= self.max_concurrent_per_ip:
            raise Exception(
                f"Rate limit exceeded: Maximum {self.max_concurrent_per_ip} concurrent sessions per IP"
            )
        
        # Generate session
        session_id = self.generate_session_id()
        session = Session(session_id, ip_address)
        
        # Store session
        self.sessions[session_id] = session
        self.ip_sessions[ip_address].append(session_id)
        
        return session
    
    def get_session(self, session_id: str) -> Optional[Session]:
        """
        Retrieve a session by ID.
        
        Args:
            session_id: Session identifier
            
        Returns:
            Session object or None if not found
        """
        return self.sessions.get(session_id)
    
    def update_session(self, session_id: str, **kwargs):
        """
        Update session fields.
        
        Args:
            session_id: Session identifier
            **kwargs: Fields to update (status, tokens_used, problem_text, solution_text, error_message)
        """
        session = self.get_session(session_id)
        if not session:
            return
        
        for key, value in kwargs.items():
            if hasattr(session, key):
                setattr(session, key, value)
    
    def add_thought_node(self, session_id: str, thought_node: dict):
        """
        Add a thought node to session.
        
        Args:
            session_id: Session identifier
            thought_node: ThoughtNode data as dictionary
        """
        session = self.get_session(session_id)
        if session:
            session.thought_nodes.append(thought_node)
    
    def _get_active_sessions_for_ip(self, ip_address: str) -> List[str]:
        """
        Get active session IDs for an IP address.
        
        Args:
            ip_address: Client IP address
            
        Returns:
            List of active session IDs
        """
        # Filter to only include sessions that still exist and aren't completed
        active = []
        for session_id in self.ip_sessions.get(ip_address, []):
            session = self.sessions.get(session_id)
            if session and session.status not in ["completed", "error"]:
                active.append(session_id)
        
        # Update IP sessions list
        if ip_address in self.ip_sessions:
            self.ip_sessions[ip_address] = active
        
        return active
    
    def cleanup_old_sessions(self) -> int:
        """
        Remove sessions older than configured cleanup time.
        
        Returns:
            Number of sessions cleaned up
        """
        cutoff_time = datetime.utcnow() - timedelta(hours=self.cleanup_hours)
        
        sessions_to_remove = []
        for session_id, session in self.sessions.items():
            if session.created_at < cutoff_time:
                sessions_to_remove.append(session_id)
        
        # Remove old sessions
        for session_id in sessions_to_remove:
            session = self.sessions[session_id]
            
            # Remove from IP tracking
            if session.ip_address in self.ip_sessions:
                if session_id in self.ip_sessions[session.ip_address]:
                    self.ip_sessions[session.ip_address].remove(session_id)
            
            # Remove session
            del self.sessions[session_id]
        
        return len(sessions_to_remove)
    
    def get_session_count(self) -> int:
        """Get total number of active sessions."""
        return len(self.sessions)
    
    def get_stats(self) -> dict:
        """Get overall statistics."""
        return {
            "total_sessions": len(self.sessions),
            "active_ips": len([ips for ips in self.ip_sessions.values() if ips]),
            "status_breakdown": self._get_status_breakdown()
        }
    
    def _get_status_breakdown(self) -> dict:
        """Get count of sessions by status."""
        breakdown = defaultdict(int)
        for session in self.sessions.values():
            breakdown[session.status] += 1
        return dict(breakdown)


# Global session manager instance
session_manager = SessionManager()

