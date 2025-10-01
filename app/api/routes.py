from fastapi import APIRouter, HTTPException, BackgroundTasks, Request
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import asyncio

from app.services.session_manager import session_manager
from app.services.anthropic_client import AnthropicService
from app.services.thinking_parser import ThinkingParser
from app.services.websocket_manager import websocket_manager

router = APIRouter(prefix="/api", tags=["api"])


# Request/Response Models
class AnalyzeRequest(BaseModel):
    """Request model for starting a new analysis."""
    problem: str = Field(..., min_length=10, max_length=5000, description="Problem statement to analyze")


class AnalyzeResponse(BaseModel):
    """Response model for analysis request."""
    session_id: str
    message: str = "Analysis started. Connect to WebSocket to receive real-time updates."
    websocket_url: str


class SessionStatusResponse(BaseModel):
    """Response model for session status."""
    session_id: str
    status: str
    thought_count: int
    tokens_used: int
    created_at: str
    has_solution: bool
    error_message: Optional[str] = None


class ExampleProblem(BaseModel):
    """Model for example problems."""
    title: str
    description: str
    problem_text: str
    difficulty: str


class FeedbackRequest(BaseModel):
    """Request model for user feedback."""
    session_id: str
    rating: int = Field(..., ge=1, le=5, description="Rating from 1-5")
    comment: Optional[str] = Field(None, max_length=1000)


# Helper function to get client IP
def get_client_ip(request: Request) -> str:
    """Extract client IP address from request."""
    if request.client:
        return request.client.host
    return "unknown"


# Background task for analysis
async def run_analysis(session_id: str, problem_text: str):
    """
    Background task to run the full analysis pipeline.
    
    Args:
        session_id: Session identifier
        problem_text: Problem to analyze
    """
    try:
        # Update session status
        session_manager.update_session(session_id, status="streaming", problem_text=problem_text)
        
        # Initialize parser
        parser = ThinkingParser(session_id)
        
        # Initialize Anthropic service
        anthropic_service = AnthropicService()
        
        # Track start time
        start_time = datetime.utcnow()
        
        # Define callback for thinking chunks
        async def on_thinking_chunk(sess_id: str, chunk: str):
            """Process thinking chunk through parser and broadcast."""
            async for thought_node in parser.parse_incremental(chunk):
                # Convert to dict
                node_dict = thought_node.model_dump(mode='json')
                
                # Store in session
                session_manager.add_thought_node(sess_id, node_dict)
                
                # Broadcast to WebSocket clients
                await websocket_manager.broadcast_new_thought(sess_id, node_dict)
        
        # Define callback for token usage
        async def on_token_usage(usage: dict):
            """Update session with token usage."""
            session_manager.update_session(
                session_id,
                tokens_used=usage.get('output_tokens', 0)
            )
        
        # Define callback for errors
        async def on_error(error_msg: str):
            """Broadcast error to clients."""
            await websocket_manager.broadcast_error(session_id, error_msg, "api_error")
        
        # Define callback for solution
        async def on_solution(solution_text: str):
            """Store solution in session."""
            session_manager.update_session(session_id, solution_text=solution_text)
        
        # Run analysis
        result = await anthropic_service.analyze_problem(
            problem_text=problem_text,
            session_id=session_id,
            on_thinking_chunk=on_thinking_chunk,      # Remove asyncio.create_task wrapper
            on_token_usage=on_token_usage,
            on_error=on_error,                        # Remove asyncio.create_task wrapper
            on_solution=on_solution
        )
        
        # Finalize any remaining parsed thoughts
        async for thought_node in parser.finalize():
            node_dict = thought_node.model_dump(mode='json')
            session_manager.add_thought_node(session_id, node_dict)
            await websocket_manager.broadcast_new_thought(session_id, node_dict)
        
        # Calculate duration
        duration = (datetime.utcnow() - start_time).total_seconds()
        
        # Update session
        session_manager.update_session(
            session_id,
            status="completed",
            tokens_used=result.get('usage', {}).get('output_tokens', 0)
        )
        
        # Broadcast thinking complete
        session = session_manager.get_session(session_id)
        await websocket_manager.broadcast_thinking_complete(
            session_id,
            {
                "total_thoughts": len(session.thought_nodes) if session else 0,
                "total_tokens": result.get('usage', {}).get('output_tokens', 0),
                "duration_seconds": duration,
                "summary": f"Completed analysis with {len(session.thought_nodes) if session else 0} thought nodes"
            }
        )
        
        # Broadcast solution ready
        if result.get('solution_text'):
            await websocket_manager.broadcast_solution_ready(
                session_id,
                {
                    "solution_text": result['solution_text'],
                    "thinking_node_count": len(session.thought_nodes) if session else 0
                }
            )
    
    except Exception as e:
        # Handle errors
        error_msg = str(e)
        session_manager.update_session(
            session_id,
            status="error",
            error_message=error_msg
        )
        await websocket_manager.broadcast_error(session_id, error_msg, "analysis_error")


@router.post("/analyze", response_model=AnalyzeResponse)
async def start_analysis(
    request: AnalyzeRequest,
    background_tasks: BackgroundTasks,
    http_request: Request
):
    """
    Start a new analysis session.
    
    Args:
        request: Analysis request with problem text
        background_tasks: FastAPI background tasks
        http_request: HTTP request object
        
    Returns:
        Session information including WebSocket URL
    """
    try:
        # Get client IP
        ip_address = get_client_ip(http_request)
        
        # Create session (with rate limiting)
        session = session_manager.create_session(ip_address)
        
        # Start analysis in background
        background_tasks.add_task(run_analysis, session.session_id, request.problem)
        
        # Clean up old sessions in background
        background_tasks.add_task(session_manager.cleanup_old_sessions)
        
        return AnalyzeResponse(
            session_id=session.session_id,
            websocket_url=f"/ws/{session.session_id}"
        )
    
    except Exception as e:
        if "Rate limit" in str(e):
            raise HTTPException(status_code=429, detail=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to start analysis: {str(e)}")


@router.get("/session/{session_id}/status", response_model=SessionStatusResponse)
async def get_session_status(session_id: str):
    """
    Get the status of an analysis session.
    
    Args:
        session_id: Session identifier
        
    Returns:
        Session status information
    """
    session = session_manager.get_session(session_id)
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return SessionStatusResponse(
        session_id=session.session_id,
        status=session.status,
        thought_count=len(session.thought_nodes),
        tokens_used=session.tokens_used,
        created_at=session.created_at.isoformat(),
        has_solution=bool(session.solution_text),
        error_message=session.error_message
    )


@router.get("/examples", response_model=list[ExampleProblem])
async def get_examples():
    """
    Get curated example problems for demonstration.
    
    Returns:
        List of example problems
    """
    examples = [
        ExampleProblem(
            title="LRU Cache Implementation",
            description="Design and implement a data structure for a Least Recently Used (LRU) cache",
            problem_text="Design and implement a data structure for a Least Recently Used (LRU) cache. It should support get and put operations. get(key) should return the value of the key if it exists, otherwise return -1. put(key, value) should insert or update the value. When the cache reaches its capacity, it should invalidate the least recently used item before inserting a new item. Both operations should run in O(1) time complexity.",
            difficulty="medium"
        ),
        ExampleProblem(
            title="Binary Search Tree Validation",
            description="Determine if a binary tree is a valid binary search tree",
            problem_text="Given the root of a binary tree, determine if it is a valid binary search tree (BST). A valid BST is defined as follows: The left subtree of a node contains only nodes with keys less than the node's key. The right subtree of a node contains only nodes with keys greater than the node's key. Both the left and right subtrees must also be binary search trees.",
            difficulty="medium"
        ),
        ExampleProblem(
            title="Two Sum Problem",
            description="Find two numbers that add up to a target value",
            problem_text="Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
            difficulty="easy"
        ),
        ExampleProblem(
            title="Merge Intervals",
            description="Merge overlapping intervals in a collection",
            problem_text="Given an array of intervals where intervals[i] = [start_i, end_i], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
            difficulty="medium"
        ),
        ExampleProblem(
            title="Longest Palindromic Substring",
            description="Find the longest palindromic substring in a given string",
            problem_text="Given a string s, return the longest palindromic substring in s. A palindrome is a string that reads the same backward as forward. For example, 'racecar' is a palindrome.",
            difficulty="medium"
        )
    ]
    
    return examples


@router.post("/feedback")
async def submit_feedback(feedback: FeedbackRequest):
    """
    Accept user feedback for a session (logged to console for demo).
    
    Args:
        feedback: User feedback including session_id, rating, and optional comment
        
    Returns:
        Confirmation message
    """
    # Verify session exists
    session = session_manager.get_session(feedback.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Log feedback to console (no persistence in MVP)
    print(f"\n{'='*60}")
    print(f"FEEDBACK RECEIVED")
    print(f"{'='*60}")
    print(f"Session ID: {feedback.session_id}")
    print(f"Rating: {feedback.rating}/5")
    print(f"Comment: {feedback.comment or 'No comment provided'}")
    print(f"Timestamp: {datetime.utcnow().isoformat()}")
    print(f"{'='*60}\n")
    
    return {
        "message": "Thank you for your feedback!",
        "session_id": feedback.session_id
    }

