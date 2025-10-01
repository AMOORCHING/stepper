from fastapi import WebSocket, WebSocketDisconnect, APIRouter
from app.services.websocket_manager import websocket_manager

router = APIRouter()


@router.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """
    WebSocket endpoint for real-time thinking stream.
    
    Args:
        websocket: WebSocket connection
        session_id: Unique session identifier
    """
    # Accept and register the connection
    await websocket_manager.connect(session_id, websocket)
    
    try:
        # Keep connection alive and listen for disconnects
        while True:
            # Wait for any message from client (mostly just to detect disconnect)
            try:
                data = await websocket.receive_text()
                # Echo back or handle client messages if needed
                # For now, we only stream server->client, so just acknowledge
            except WebSocketDisconnect:
                break
    except Exception as e:
        # Handle any other errors
        pass
    finally:
        # Clean up connection on disconnect
        await websocket_manager.disconnect(session_id, websocket)

