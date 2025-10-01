# Stepper

An interactive visualization tool that renders Claude 4.5's internal reasoning process as a real-time force-directed graph. Submit a reasoning problem and watch as thought nodes emerge—analytical steps, decision points, verification checks, and alternative approaches—connected through their logical dependencies.

## What It Does

Stepper connects to Claude's extended thinking API and translates raw reasoning text into a structured graph visualization. Each thought node is classified by type (Analysis, Decision, Verification, Alternative, Implementation), positioned using physics simulation, and connected to related thoughts through automatically detected dependencies.

The visualization updates in real-time as Claude thinks, allowing you to trace the logical pathway from problem to solution. Click nodes to explore their content, pan and zoom to navigate complex reasoning chains, and watch as confidence-weighted nodes settle into their natural positions.

## Features

**Backend**
- Real-time streaming from Claude Sonnet 4.5 extended thinking API
- Intelligent parsing of thinking text into structured thought nodes
- Automatic classification of thought types using keyword heuristics
- Dependency detection based on linguistic cues and semantic similarity
- WebSocket delivery for real-time frontend updates
- Session management with rate limiting
- No database required (in-memory storage)

**Frontend**
- Canvas-based force-directed graph using D3-force physics simulation
- Real-time node appearance animations with anime.js
- Interactive controls: pan, zoom, click, hover
- Color-coded thought types with confidence-weighted sizing
- Gradient edges showing logical flow between thoughts
- Responsive design with performance optimization
- Demo mode with sample problems
- State management with Zustand

## Tech Stack

**Backend**
- **FastAPI** - Modern async web framework
- **Anthropic SDK** - Claude API integration with streaming
- **WebSocket** - Real-time bidirectional communication
- **Python 3.11+** - Async/await support

**Frontend**
- **React 18** - UI framework with hooks
- **Vite** - Build tool and dev server
- **D3-force** - Physics simulation for graph layout
- **anime.js** - Smooth node animations
- **Zustand** - Lightweight state management
- **Canvas API** - High-performance 2D rendering

## Setup Instructions

### Prerequisites

- **Python 3.11+** - Backend runtime
- **Node.js 18+** - Frontend build tool
- **Anthropic API key** - [Get one here](https://console.anthropic.com/)

### Backend Setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Add your Anthropic API key to .env
# ANTHROPIC_API_KEY=your_actual_api_key_here
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# The frontend expects the backend on localhost:8000
# No additional configuration needed for local development
```

### Running the Application

**Terminal 1 - Backend:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173`

Backend API documentation: `http://localhost:8000/docs`

## Usage

### Quick Start

1. Open the application at `http://localhost:5173`
2. Either:
   - **Try a demo:** Click "View demo visualization" to see a sample graph with pre-loaded nodes
   - **Submit a problem:** Enter a reasoning problem (math puzzle, logic question, word problem) and click "Start Analysis"
3. Watch as Claude thinks through the problem and nodes appear in real-time
4. Interact with the visualization:
   - **Click** nodes to view detailed content in a side panel
   - **Hover** over nodes to see type and confidence
   - **Drag** to pan the canvas
   - **Scroll** to zoom in/out
   - Use **zoom controls** in the bottom-right corner

### Example Problems

- "I went to the market and bought 10 apples. I gave 2 apples to the neighbor and 2 to the repairman. I then went and bought 5 more apples and ate 1. How many apples did I remain with?"
- "Sarah is twice as old as her brother was 2 years ago. In 3 years, Sarah will be 27. How old is her brother now?"
- "A water tank can be filled by pipe A in 4 hours and by pipe B in 6 hours. If both pipes are opened together, how long will it take to fill the tank?"

## API Endpoints

### Health Check
```
GET /api/health
```
Returns server status and version.

### Start Analysis
```
POST /api/analyze
Content-Type: application/json

{
  "problem": "Your reasoning problem here"
}
```
Starts a new thinking session. Returns `session_id` and connects via WebSocket.

### WebSocket Connection
```
WS /ws/{session_id}
```
Real-time streaming of thought nodes as they're generated.

**Message Types:**
- `thought_node` - New node with id, type, content, confidence, dependencies
- `thinking_complete` - Analysis finished
- `solution_ready` - Final solution available
- `error` - Error occurred during analysis

## How It Works

1. **Problem Submission:** User submits a reasoning problem via the web interface
2. **Streaming Analysis:** Backend sends the problem to Claude's extended thinking API
3. **Real-time Parsing:** As Claude's thinking text streams in, the parser segments it into logical thought units
4. **Node Classification:** Each segment is classified (Analysis, Decision, Verification, etc.) based on linguistic patterns
5. **Dependency Detection:** The parser identifies references and shared keywords to link related thoughts
6. **WebSocket Delivery:** Parsed nodes are immediately sent to the frontend via WebSocket
7. **Physics Simulation:** D3-force calculates optimal positions for nodes based on their connections
8. **Interactive Visualization:** Nodes animate into view with smooth transitions, forming a readable graph structure

## Project Structure

```
stepper/
├── app/                              # Backend (Python/FastAPI)
│   ├── main.py                       # FastAPI app entry point
│   ├── config.py                     # Configuration management
│   ├── api/
│   │   ├── routes.py                 # REST API endpoints
│   │   └── websocket.py              # WebSocket connection handlers
│   ├── models/
│   │   └── thought_node.py           # ThoughtNode data model
│   ├── services/
│   │   ├── anthropic_client.py       # Claude API client with streaming
│   │   ├── thinking_parser.py        # Parse thinking text into nodes
│   │   ├── session_manager.py        # In-memory session storage
│   │   └── websocket_manager.py      # WebSocket connection management
│   └── utils/
│       └── text_analysis.py          # Keyword extraction, confidence scoring
├── frontend/                         # Frontend (React/Vite)
│   ├── src/
│   │   ├── App.jsx                   # Main app component
│   │   ├── components/
│   │   │   ├── ThinkingScene2D.jsx   # Canvas-based graph visualization
│   │   │   ├── NodeDetailPanel.jsx   # Node information side panel
│   │   │   ├── MetricsPanel.jsx      # Stats display with animated counters
│   │   │   ├── layout/
│   │   │   │   ├── Header.jsx        # Top navigation
│   │   │   │   └── Sidebar.jsx       # Control sidebar
│   │   │   └── ui/                   # Reusable UI components
│   │   ├── hooks/
│   │   │   ├── useWebSocket.js       # WebSocket connection hook
│   │   │   └── useNodeInteraction.js # Node click/hover handlers
│   │   ├── store/
│   │   │   └── thinkingStore.js      # Zustand state management
│   │   └── utils/
│   │       └── nodeColors.js         # Thought type color mapping
│   ├── package.json
│   └── vite.config.js
├── requirements.txt                  # Python dependencies
├── .env.example
└── README.md
```

## Thought Node Types

Nodes are automatically classified into five categories based on linguistic patterns:

| Type | Color | Description | Example Keywords |
|------|-------|-------------|------------------|
| **Analysis** | Black | Analytical thinking and examination | "let's consider", "need to analyze", "examine" |
| **Decision** | Red | Decision points and choices | "will use", "best approach", "should choose" |
| **Verification** | Green | Checks and validation steps | "verify", "confirm", "ensure", "test" |
| **Alternative** | Orange | Alternative approaches explored | "alternatively", "could also", "different approach" |
| **Implementation** | Black | Concrete implementation steps | "implement", "create", "build", "write" |

Node size is weighted by confidence score (0-1), calculated from the certainty expressed in the text.

## Troubleshooting

**Backend won't start:**
- Ensure Python 3.11+ is installed
- Check that your Anthropic API key is set in `.env`
- Verify all dependencies installed: `pip install -r requirements.txt`

**Frontend shows connection error:**
- Confirm backend is running on port 8000
- Check browser console for specific error messages
- Ensure no firewall blocking localhost:8000

**Nodes not appearing:**
- Verify WebSocket connection status in the sidebar (should show "Connected")
- Check backend terminal for error messages
- Try demo mode first to test visualization independently

**Visualization is slow:**
- Large graphs (50+ nodes) may impact performance on lower-end devices
- Try adjusting the "Node Delay" slider to reduce animation overhead
- Use zoom controls to focus on specific subgraphs

## Development

```bash
# Backend with auto-reload
uvicorn app.main:app --reload

# Frontend with hot module replacement
cd frontend && npm run dev

# Access API documentation
# OpenAPI docs: http://localhost:8000/docs
# ReDoc: http://localhost:8000/redoc
```

## Acknowledgments

Inspired by [Anthropic's research on tracing thoughts in language models](https://www.anthropic.com/research/tracing-thoughts-language-model) and built with Claude's extended thinking API.

## License

See LICENSE file for details.
