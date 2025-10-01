from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import websocket

# Initialize FastAPI application
app = FastAPI(
    title="Claude Thinking Visualizer API",
    description="Backend API for real-time streaming and parsing of Claude's extended thinking",
    version="1.0.0"
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount WebSocket routes
app.include_router(websocket.router)


@app.get("/api/health")
async def health_check():
    """Health check endpoint to verify the API is running."""
    return {
        "status": "healthy",
        "version": "1.0.0"
    }

