# GitVMD - Git Virtual Machine Desktop

A lightweight, browser-based virtual desktop environment that runs entirely on GitHub Pages. Built with WebAssembly, designed for CI/CD, and ready for AI integration.

## Features

- **Zero Infrastructure**: Runs completely on free GitHub Pages
- **Multiple VM Engines**: Support for v86, WebContainers, and custom backends
- **AI-Ready**: Built-in support for ONNX Runtime Web and WebLLM
- **Offline-First**: Full functionality without internet after initial load
- **Configurable Variants**: Easy customization via JSON configuration
- **CI/CD Native**: Automated builds and deployments via GitHub Actions
- **Privacy-Focused**: All processing happens on-device

## Quick Start

### Visit a Variant

```bash
# Minimal Alpine Linux environment
https://yourusername.github.io/gitvmd/?variant=minimal

# Full developer environment
https://yourusername.github.io/gitvmd/?variant=dev-env

# AI-powered desktop
https://yourusername.github.io/gitvmd/?variant=ai-desktop
```

### Custom Configuration via URL

```bash
# Custom memory allocation
https://yourusername.github.io/gitvmd/?memory=1024M

# Enable AI with specific theme
https://yourusername.github.io/gitvmd/?ai=true&theme=dark

# Specify custom image
https://yourusername.github.io/gitvmd/?engine=v86&image=ubuntu.img
```

## Available Variants

### Minimal
- **Size**: ~10MB
- **Memory**: 256MB
- **Boot Time**: <3s
- **Features**: Terminal only, BusyBox utilities
- **Use Case**: Lightweight scripting, learning

### Developer Environment
- **Size**: ~100MB
- **Memory**: 1GB
- **Boot Time**: <5s
- **Features**: Node.js, Git, Python, code editor, AI code completion
- **Use Case**: Web development, prototyping

### AI Desktop
- **Size**: ~500MB + models
- **Memory**: 2GB
- **Boot Time**: <10s
- **Features**: Full desktop, LLM chatbot, image generation, voice control
- **Use Case**: AI experimentation, creative work

## Architecture

```
Browser
├── Main Thread (UI)
│   ├── Desktop Shell
│   ├── Terminal Emulator
│   └── File Manager
├── Web Workers
│   ├── VM Worker (v86/WebContainer)
│   ├── AI Worker (ONNX/WebLLM)
│   └── Storage Worker
├── IndexedDB (Filesystem)
└── Service Worker (Offline)
```

## Project Structure

```
gitvmd/
├── src/
│   ├── core/              # VM engine, storage, config
│   ├── ui/                # Desktop UI components
│   ├── ai/                # AI integration layer
│   ├── config/            # Configuration variants
│   └── workers/           # Web Worker implementations
├── scripts/               # Build scripts
├── tests/                 # Test suites
├── .github/workflows/     # CI/CD pipelines
├── RESEARCH.md            # Comprehensive research document
└── ARCHITECTURE.md        # Technical architecture spec
```

## Development

### Prerequisites

- Node.js 20+
- npm or yarn

### Setup

```bash
# Clone repository
git clone https://github.com/yourusername/gitvmd.git
cd gitvmd

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
open http://localhost:5173
```

### Build

```bash
# Production build
npm run build

# Build specific variant
npm run build:variant -- minimal

# Optimize assets
npm run optimize
```

### Testing

```bash
# Run all tests
npm test

# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

## Configuration

### Creating a Custom Variant

1. Create a new file in `src/config/variants/my-variant.json`:

```json
{
  "extends": "default",
  "name": "My Custom Variant",
  "description": "My custom configuration",
  "vm": {
    "engine": "v86",
    "memory": "512M",
    "image": "my-custom.img"
  },
  "ui": {
    "theme": "dark"
  },
  "ai": {
    "enabled": true,
    "models": ["code-completion"]
  }
}
```

2. Build and deploy:

```bash
npm run build
git add .
git commit -m "Add custom variant"
git push
```

3. Access at:
```
https://yourusername.github.io/gitvmd/?variant=my-variant
```

### Configuration Schema

See `src/config/schema.json` for the full configuration schema.

Key configuration sections:
- `vm`: Virtual machine settings (engine, memory, image)
- `ui`: User interface options (theme, components)
- `ai`: AI integration settings (models, backend)
- `assets`: Asset loading and caching strategy

## CI/CD

The project uses GitHub Actions for automated builds and deployments:

- **Build**: Validates, tests, and builds on every push
- **Deploy**: Automatically deploys to GitHub Pages on main branch
- **Optimize**: Weekly asset optimization

### Workflows

- `.github/workflows/build-and-deploy.yml` - Main CI/CD pipeline
- `.github/workflows/test.yml` - Comprehensive testing
- `.github/workflows/optimize-assets.yml` - Asset optimization

## Performance

### Size Budget

| Component | Initial | Total |
|-----------|---------|-------|
| Core JS/CSS | <400KB | <1MB |
| WASM | <2MB | <10MB |
| Disk Images | 0 | <800MB |
| **Total** | **<3MB** | **<1GB** |

### Timing Targets

- Time to Interactive: <3s
- VM Boot: <5s
- First Paint: <1s

## Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | ✅ Full |
| Firefox | 88+ | ✅ Full |
| Safari | 15.2+ | ⚠️ Limited WebGPU |
| Edge | 90+ | ✅ Full |

### Required Features
- WebAssembly
- IndexedDB
- Service Workers
- Web Workers
- WebGPU (for AI features)

## AI Capabilities

### Supported Models

- **Text Generation**: Llama 3.2, Mistral, Phi
- **Code Completion**: StarCoder, CodeGen
- **Image Processing**: CLIP, Stable Diffusion
- **Speech**: Whisper (transcription)

### Example Usage

```javascript
// Get AI service
const ai = await vm.getService('ai');

// Generate text
const response = await ai.generate({
    model: 'llama-3.2-1b',
    prompt: 'Explain quantum computing',
    maxTokens: 200
});

// Code completion
const code = await ai.complete({
    model: 'starcoder',
    code: 'function fibonacci(',
    language: 'javascript'
});
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit: `git commit -m "Add my feature"`
6. Push: `git push origin feature/my-feature`
7. Create a Pull Request

## Security

### Threat Model

All code runs within the browser's security sandbox. See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed security considerations.

### Reporting Vulnerabilities

Please report security issues to security@example.com (do not open public issues).

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- [v86](https://github.com/copy/v86) - x86 emulation in browser
- [WebContainers](https://webcontainers.io/) - Browser-based Node.js runtime
- [ONNX Runtime](https://onnxruntime.ai/) - Cross-platform AI inference
- [WebLLM](https://github.com/mlc-ai/web-llm) - LLM inference in browser

## Roadmap

### v1.0 (Current)
- [x] Basic v86 integration
- [x] Configuration system
- [x] Minimal and dev variants
- [x] CI/CD pipeline

### v1.1 (Next)
- [ ] ONNX Runtime Web integration
- [ ] WebLLM support
- [ ] AI desktop variant
- [ ] Plugin system

### v2.0 (Future)
- [ ] WebRTC collaboration
- [ ] WebGPU rendering
- [ ] Container support
- [ ] Native app compatibility

## Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/yourusername/gitvmd/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/gitvmd/discussions)

## FAQ

### How much does this cost?
Zero. It runs entirely on free GitHub Pages infrastructure.

### Can I run Windows?
Yes, v86 supports Windows 95/98/2000. Windows XP is experimental.

### Does this work offline?
Yes, after the initial load, everything works offline thanks to Service Workers.

### What about privacy?
All processing happens on your device. No data is sent to external servers.

### Can I use my own OS image?
Yes, you can specify custom images via configuration or URL parameters.

### How do I add AI models?
Create a custom variant with your desired models, or load them dynamically via the AI service API.

---

**Built with ❤️ for the open web**
