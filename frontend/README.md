# Stepper Frontend - 3D Thinking Visualization

A beautiful, interactive 3D visualization of AI thinking processes built with React, Three.js, and React Three Fiber.

## 🚀 Features

- **3D Scene Rendering** - Real-time 3D visualization using Three.js and React Three Fiber
- **Dynamic Node System** - Thought nodes with confidence-based scaling and type-based coloring
- **Interactive Controls**
  - Click nodes to view detailed information
  - Double-click to focus camera on specific nodes
  - Drag to rotate the scene
  - Scroll to zoom in/out
  - Keyboard shortcuts for quick actions
- **Post-Processing Effects** - Bloom effect for glowing emissive materials
- **WebSocket Integration** - Real-time updates from the backend thinking process
- **Performance Optimization**
  - Automatic device detection (high/medium/low tier)
  - FPS monitoring with auto-optimization
  - Frustum culling for off-screen nodes
  - Configurable quality settings
- **Auto-Focus & Animation** - Smooth camera transitions and appearance animations
- **Responsive Design** - Works on various screen sizes and devices

## 📦 Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Three.js** - 3D graphics library
- **React Three Fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for R3F
- **@react-three/postprocessing** - Post-processing effects
- **Zustand** - State management
- **anime.js** - Animation library
- **WebSocket** - Real-time communication

## 🛠️ Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables:**
   ```env
   VITE_API_URL=http://localhost:8001
   VITE_WS_URL=ws://localhost:8001
   ```

## 🏃 Development

### Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for production:
```bash
npm run build
```

### Preview production build:
```bash
npm run preview
```

## 🎮 Usage

### Demo Mode

1. Launch the app and click "🚀 Launch 3D Visualization"
2. Watch nodes appear with staggered animations
3. Interact with nodes using mouse and keyboard

### WebSocket Mode

1. Start the backend server (see main README)
2. Enter a session ID
3. Enable WebSocket Mode
4. Launch visualization to see real-time thinking process

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `R` | Reset camera to initial position |
| `Space` | Toggle auto-rotation on/off |
| `F` | Toggle fullscreen mode |
| `Esc` | Close detail panel |

## 🖱️ Mouse Controls

| Action | Effect |
|--------|--------|
| **Click** node | Show detailed information panel |
| **Double-click** node | Focus camera on the node |
| **Drag** | Rotate camera around scene |
| **Scroll** | Zoom in/out |
| **Hover** | Highlight node (1.3x scale) |

## 🎨 Node Types & Colors

| Type | Color | Description |
|------|-------|-------------|
| **Analysis** | Cyan (#4ECDC4) | Analytical thinking steps |
| **Decision** | Red (#FF6B6B) | Decision points |
| **Verification** | Light Green (#95E1D3) | Verification checks |
| **Alternative** | Yellow (#FFE66D) | Alternative approaches |
| **Implementation** | Mint (#A8E6CF) | Implementation steps |

## 📊 Performance Tips

### For Low-End Devices:
- The app automatically disables bloom on low-tier devices
- FPS monitoring triggers optimizations if performance drops below 30 FPS
- Disable bloom manually using the "✨ Bloom" button

### For Best Experience:
- **Hardware:**
  - Modern GPU (2GB+ VRAM)
  - 4+ CPU cores
  - 8GB+ RAM
- **Browser:** Latest Chrome or Edge for best WebGL performance
- **Settings:** Keep bloom enabled for visual quality

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ThinkingScene.jsx      # Main 3D scene setup
│   │   ├── ThoughtNode3D.jsx      # Individual node renderer
│   │   ├── ThoughtEdge3D.jsx      # Edge/connection renderer
│   │   ├── NodeDetailPanel.jsx    # Node information panel
│   │   ├── PerformanceMonitor.jsx # FPS & performance tracking
│   │   └── ThreeTest.jsx          # Test component
│   ├── hooks/
│   │   ├── useWebSocket.js        # WebSocket connection
│   │   ├── useCameraAnimation.js  # Camera controls
│   │   └── useNodeInteraction.js  # Node interactions
│   ├── utils/
│   │   ├── layoutAlgorithm.js     # 3D node positioning
│   │   ├── nodeColors.js          # Color mapping
│   │   └── animations.js          # Animation helpers
│   ├── store/
│   │   └── thinkingStore.js       # Zustand state management
│   ├── styles/
│   │   └── global.css             # Global styles
│   ├── App.jsx                     # Root component
│   └── main.jsx                    # Entry point
├── public/
├── index.html
├── vite.config.js
└── package.json
```

## 🔧 Configuration

### Vite Config (`vite.config.js`)

The project uses Vite with proxy configuration for the backend:

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true
      },
      '/api': {
        target: 'http://localhost:8000'
      }
    }
  }
})
```

## 🐛 Troubleshooting

### WebGL not supported
- Ensure your browser supports WebGL 2.0
- Update your graphics drivers
- Try a different browser (Chrome/Edge recommended)

### Low FPS / Performance Issues
- Enable FPS stats to monitor performance
- Disable bloom effect manually
- Close other GPU-intensive applications
- Reduce browser zoom level to 100%

### WebSocket connection fails
- Ensure backend server is running on port 8000
- Check that session ID is valid
- Verify CORS settings on backend
- Check browser console for detailed error messages

### Nodes not appearing
- Check browser console for errors
- Verify WebSocket connection is established
- Ensure backend is sending proper node data format
- Try demo mode first to test rendering

## 📝 Development Notes

### Adding New Node Types

1. Add type to `utils/nodeColors.js`:
   ```javascript
   export const NODE_COLORS = {
     NewType: '#HEXCOLOR'
   }
   ```

2. Add badge styles to `styles/global.css`:
   ```css
   .badge-newtype {
     background: rgba(HEX, 0.2);
     color: #HEXCOLOR;
   }
   ```

### Customizing Animations

Edit animation parameters in `utils/animations.js`:
- `animateNodeAppearance()` - Node entrance
- `animateNodePulse()` - Active node pulsing
- `animateEdgeDrawing()` - Edge fade-in
- `animateNodeHover()` - Hover scale effect

### Performance Tuning

Adjust in `components/PerformanceMonitor.jsx`:
- `fpsThreshold` - FPS below which optimizations trigger (default: 30)
- `checkInterval` - How often to check FPS in frames (default: 60)

## 🧪 Testing

Currently using manual testing. To test:

1. **Demo Mode:** Launch visualization and verify all animations work
2. **WebSocket Mode:** Connect to backend and verify real-time updates
3. **Interactions:** Test all mouse and keyboard controls
4. **Performance:** Monitor FPS with various node counts (5, 20, 50, 100)

## 📄 License

See LICENSE file in repository root.

## 🤝 Contributing

Contributions welcome! Please read the main project README for guidelines.

## 📞 Support

For issues and questions:
- Check troubleshooting section above
- Review browser console for error messages
- Open an issue in the GitHub repository
