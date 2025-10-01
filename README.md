# Stepper - Claude Thinking Visualizer

Real-time visualization of Claude's extended thinking process, showing how AI reasoning unfolds step-by-step.

## Features

- Real-time streaming from Claude Sonnet 4.5 extended thinking API
- Parse thinking into structured thought nodes with relationships
- WebSocket-based real-time delivery to frontend
- Session management with rate limiting
- In-memory session storage (no database required)

## Tech Stack

- **FastAPI** - Modern async web framework
- **Anthropic SDK** - Claude API integration with streaming
- **WebSocket** - Real-time bidirectional communication
- **Python 3.11+** - Async/await support

## Setup Instructions

### 1. Prerequisites

- Python 3.11 or higher
- Anthropic API key ([get one here](https://console.anthropic.com/))

### 2. Installation

```bash
# Clone the repository
git clone <repository-url>
cd stepper

# Install dependencies
pip install -r requirements.txt
```

### 3. Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your Anthropic API key
# ANTHROPIC_API_KEY=your_actual_api_key_here
```

### 4. Run the Server

```bash
# Start the development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Health Check
```
GET /api/health
```
Returns server status and version.

### Start Analysis (Coming Soon)
```
POST /api/analyze
```
Start a new thinking analysis session.

### WebSocket Connection (Coming Soon)
```
WS /ws/{session_id}
```
Real-time streaming of thought nodes.

## Development

```bash
# Run with auto-reload for development
uvicorn app.main:app --reload

# Access API documentation
# OpenAPI docs: http://localhost:8000/docs
# ReDoc: http://localhost:8000/redoc
```

## Project Structure

```
stepper/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Configuration management
│   ├── api/                 # API endpoints
│   │   ├── __init__.py
│   │   ├── routes.py        # REST endpoints
│   │   └── websocket.py     # WebSocket handlers
│   ├── models/              # Data models
│   │   ├── __init__.py
│   │   └── thought_node.py  # ThoughtNode schema
│   ├── services/            # Business logic
│   │   ├── __init__.py
│   │   ├── anthropic_client.py    # Anthropic API client
│   │   ├── thinking_parser.py     # Thinking text parser
│   │   ├── websocket_manager.py   # WebSocket management
│   │   └── session_manager.py     # Session storage
│   └── utils/               # Utility functions
│       ├── __init__.py
│       └── text_analysis.py # Text processing helpers
├── requirements.txt
├── .env.example
└── README.md
```

## License

See LICENSE file for details.
