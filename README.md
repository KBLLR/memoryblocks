# MemoryBlocks

A geospatial narrative viewer for exploring NeRF (Gaussian Splatting) captures in a unified 3D environment.

## Overview

MemoryBlocks is a modern web-based 3D viewer that combines:
- **NeRF Visualization**: Real-time rendering of Gaussian Splatting models using Luma Labs
- **Geospatial Positioning**: Accurate placement of captures based on GPS coordinates
- **Narrative Structure**: Scene-based storytelling with local metadata
- **Interactive Controls**: Real-time environment and model manipulation

Built with Vite, TypeScript, and Three.js - no framework dependencies.

## Features

### Core Functionality
- 🌍 **Geospatial Mapping**: Converts lat/lon coordinates to 3D scene positions
- 🎨 **Dynamic Sky**: Day/night cycle with adjustable time of day (0-24 hours)
- 🏗️ **Central Platform**: 60x60m base platform for model staging
- 📦 **NeRF Loading**: Dynamic loading of Luma capture URLs
- 🎮 **Interactive UI**: UIL-based control panel for navigation and tweaks

### Scene Management
- Local metadata storage (no external API calls)
- Sequential navigation (next/previous)
- Direct scene selection by ID or index
- Scene information display (title, description, location)

### Environment Controls
- Time of day slider (affects lighting and sky)
- Shadow system synchronized with sun position
- Ambient and directional lighting

### Model Adjustments
- Scale control (0.1x - 5.0x)
- Vertical offset adjustment
- Transform reset functionality

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install --legacy-peer-deps

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm preview
```

### Project Structure

```
memoryblocks/
├── src/
│   ├── main.ts                 # Application entry point
│   ├── PlatformEnvironment.ts  # Platform and sky system
│   ├── NeRFLoader.ts          # NeRF model loading and management
│   ├── GeoSpatial.ts          # Coordinate transformation utilities
│   ├── SceneManager.ts        # Scene navigation and loading
│   ├── UIManager.ts           # UI controls (UIL integration)
│   ├── scenes.ts              # Local scene metadata
│   └── types/
│       └── uil.d.ts           # TypeScript declarations for UIL
├── index.html                 # HTML entry point
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── vite.config.ts            # Vite bundler configuration
```

## Adding New Scenes

Edit `src/scenes.ts` to add new NeRF captures:

```typescript
{
  id: 'my-scene',
  title: 'My Amazing Scene',
  url: 'https://lumalabs.ai/capture/YOUR-CAPTURE-ID',
  location: {
    latitude: 40.4155,
    longitude: -3.7074,
    altitude: 650
  },
  description: 'A beautiful capture of...',
  captureDate: '2024-03-15',
  tags: ['nature', 'urban']
}
```

## Usage

### Via UI Panel
- Use the dropdown to select scenes
- Click "Next Scene" / "Previous Scene" to navigate
- Adjust "Time (H)" slider to change time of day (0-24)
- Modify model scale and Y offset as needed
- Click "Reset Transforms" to restore defaults

### Via Console
```javascript
// List all available scenes
listScenes()

// Load scene by index
loadScene(0)

// Load scene by ID
loadScene('plaza-mayor')
```

## Technical Details

### Coordinate System
- **X-axis**: East (positive east, negative west)
- **Y-axis**: Altitude (up/down)
- **Z-axis**: North (negative north, positive south - Three.js convention)

### Geospatial Projection
Uses equirectangular projection for lat/lon to Cartesian conversion. Accurate for scenes within ~10km radius. The first loaded scene becomes the origin (0,0,0).

### Lighting System
- **Directional Light**: Simulates the sun, position synchronized with time of day
- **Ambient Light**: General scene illumination, dims during night
- **Shadow Mapping**: PCF soft shadows with 2048x2048 resolution

### Performance Considerations
- Gaussian Splatting models are GPU-intensive
- Bundle size: ~1MB (includes Luma library)
- Recommended: Modern GPU with WebGL 2.0 support

## Dependencies

### Production
- **three** (^0.170.0): 3D rendering engine
- **@lumaai/luma-web** (^0.2.2): Gaussian Splatting NeRF renderer
- **uil** (^4.3.25): Lightweight UI library

### Development
- **typescript** (^5.3.3): Type safety and modern JavaScript features
- **vite** (^5.0.11): Fast build tool and dev server

## Architecture Decisions

1. **No Framework**: Vanilla TypeScript for maximum performance and minimal overhead
2. **Local Metadata**: All scene data stored locally to eliminate API dependencies
3. **Modular Design**: Each component is self-contained and reusable
4. **TypeScript First**: Strong typing for better developer experience
5. **Modern Best Practices**: ES modules, async/await, proper disposal patterns

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 15+

Requires WebGL 2.0 support.

## Known Limitations

1. Geospatial accuracy decreases beyond ~10km from origin
2. Only one NeRF model loaded at a time (by design)
3. Large NeRF captures may require loading time
4. Mobile performance varies based on GPU capabilities

## Future Enhancements

- Multiple simultaneous NeRF models
- Camera path animation between scenes
- VR/AR support
- Custom skybox textures
- Advanced post-processing effects

## License

This project is an adaptation from cityblocks and threejs-nerf-visualizer repositories.

## Credits

- Three.js community
- Luma Labs for Gaussian Splatting technology
- UIL library by Lo-Th
