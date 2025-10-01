from pydantic import BaseModel, Field
from typing import List, Optional, Tuple
from enum import Enum
from datetime import datetime


class ThoughtType(Enum):
    """Classification of thought node types based on thinking patterns."""
    ANALYSIS = "analysis"
    DECISION = "decision"
    VERIFICATION = "verification"
    ALTERNATIVE = "alternative"
    IMPLEMENTATION = "implementation"


class Position(BaseModel):
    """2D position for graph visualization."""
    x: float
    y: float


class ThoughtNode(BaseModel):
    """
    Structured representation of a single thought in Claude's thinking process.
    """
    id: str = Field(..., description="Unique identifier for this thought node")
    type: ThoughtType = Field(..., description="Classification of the thought type")
    content: str = Field(..., description="The actual thinking text content")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score 0.0-1.0")
    keywords: List[str] = Field(default_factory=list, description="Key terms extracted from content")
    dependencies: List[str] = Field(default_factory=list, description="IDs of nodes this thought depends on")
    position: Position = Field(..., description="Position for graph layout")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="When this thought was created")
    session_id: str = Field(..., description="Session this thought belongs to")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "node_abc123",
                "type": "analysis",
                "content": "First, I need to understand the problem requirements...",
                "confidence": 0.85,
                "keywords": ["requirements", "problem", "understand"],
                "dependencies": [],
                "position": {"x": 0, "y": 0},
                "timestamp": "2024-01-01T00:00:00Z",
                "session_id": "session_xyz"
            }
        }


class WebSocketEvent(BaseModel):
    """Base model for WebSocket events sent to clients."""
    event_type: str = Field(..., description="Type of event: new_thought, thinking_complete, solution_ready, error")
    session_id: str = Field(..., description="Session identifier")
    data: dict = Field(..., description="Event payload")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ThinkingCompleteEvent(BaseModel):
    """Event emitted when thinking process completes."""
    total_thoughts: int
    total_tokens: int
    duration_seconds: float
    summary: Optional[str] = None


class SolutionReadyEvent(BaseModel):
    """Event emitted when final solution is ready."""
    solution_text: str
    thinking_node_count: int


class ErrorEvent(BaseModel):
    """Event emitted when an error occurs."""
    error_message: str
    error_type: str = "general"

