# GitVMD Architecture Specification

## Overview

GitVMD (Git Virtual Machine Desktop) is a lightweight, browser-based virtual desktop environment designed to run entirely on GitHub Pages. It provides a parameterizable base system that can be customized through configuration variants and URL parameters, following CI/CD best practices and incorporating AI integration capabilities.

---

## Core Design Principles

### 1. **Modular Architecture**
Each component is independent and loosely coupled through well-defined interfaces.

### 2. **Configuration-Driven**
Behavior is controlled through JSON configurations that can be versioned in Git.

### 3. **Progressive Loading**
Load only what's needed when it's needed, keeping initial bundle minimal.

### 4. **Offline-First**
Full functionality without internet connection after initial load.

### 5. **AI-Native**
Built from the ground up with AI integration in mind.

### 6. **Git-Centric**
Designed for version control, branching, and collaborative development.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Main Thread (UI)                          │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │ │
│  │  │ Desktop  │  │ Terminal │  │   File   │            │ │
│  │  │  Shell   │  │ Emulator │  │ Manager  │            │ │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘            │ │
│  │       │             │             │                   │ │
│  │       └─────────────┴─────────────┘                   │ │
│  │                     │                                 │ │
│  │               ┌─────▼─────┐                          │ │
│  │               │ VM Engine │                          │ │
│  │               │ Abstraction│                          │ │
│  │               └─────┬─────┘                          │ │
│  └─────────────────────┼────────────────────────────────┘ │
│                        │                                   │
│  ┌─────────────────────┼────────────────────────────────┐ │
│  │            Web Workers (Background)                  │ │
│  │  ┌─────────────────┐  ┌─────────────┐  ┌──────────┐│ │
│  │  │   VM Worker     │  │ AI Worker   │  │ Storage  ││ │
│  │  │   (v86/etc)     │  │ (ONNX/LLM)  │  │ Worker   ││ │
│  │  └────────┬────────┘  └──────┬──────┘  └────┬─────┘│ │
│  └───────────┼──────────────────┼──────────────┼──────┘ │
│              │                  │              │         │
│  ┌───────────▼──────────────────▼──────────────▼──────┐ │
│  │           Browser Storage Layer                    │ │
│  │  ┌──────────────┐  ┌──────────┐  ┌─────────────┐  │ │
│  │  │  IndexedDB   │  │  Cache   │  │ LocalStorage│  │ │
│  │  │ (Filesystem) │  │   API    │  │  (Config)   │  │ │
│  │  └──────────────┘  └──────────┘  └─────────────┘  │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │         Service Worker (Offline Support)           │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
                           │
                           │ HTTP/HTTPS
                           ▼
          ┌────────────────────────────────┐
          │     GitHub Pages CDN           │
          │  ┌──────────┐  ┌────────────┐ │
          │  │  Static  │  │   Assets   │ │
          │  │  Assets  │  │  (Chunks)  │ │
          │  └──────────┘  └────────────┘ │
          └────────────────────────────────┘
```

---

## Component Specifications

### 1. VM Engine Abstraction Layer

**Location**: `src/core/vm-engine.js`

**Purpose**: Provides a unified interface for different VM backends (v86, WebContainers, etc.)

**Interface**:
```typescript
interface VMEngine {
    boot(config: VMConfig): Promise<void>;
    shutdown(): Promise<void>;
    reset(): Promise<void>;

    // State management
    saveState(): Promise<VMState>;
    loadState(state: VMState): Promise<void>;

    // Storage
    mountFilesystem(chunks: DiskChunk[]): Promise<void>;
    readFile(path: string): Promise<Uint8Array>;
    writeFile(path: string, data: Uint8Array): Promise<void>;

    // Network
    setNetworkAdapter(adapter: NetworkAdapter): void;

    // Events
    on(event: string, handler: Function): void;
    off(event: string, handler: Function): void;
}
```

**Adapters**:
- `V86Adapter`: Full x86 emulation
- `WebContainerAdapter`: Node.js environments
- `CustomAdapter`: Extensible for future VMs

### 2. Configuration System

**Location**: `src/config/`

**Schema** (`schema.json`):
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "vm": {
      "type": "object",
      "properties": {
        "engine": { "enum": ["v86", "webcontainer", "custom"] },
        "memory": { "type": "string", "pattern": "^[0-9]+[MG]$" },
        "cpus": { "type": "integer", "minimum": 1, "maximum": 4 },
        "image": { "type": "string" },
        "network": { "type": "boolean" }
      },
      "required": ["engine", "memory"]
    },
    "ui": {
      "type": "object",
      "properties": {
        "theme": { "enum": ["light", "dark", "auto"] },
        "desktop": { "type": "boolean" },
        "terminal": { "type": "boolean" },
        "fileManager": { "type": "boolean" }
      }
    },
    "ai": {
      "type": "object",
      "properties": {
        "enabled": { "type": "boolean" },
        "backend": { "enum": ["webgpu", "webgl", "wasm"] },
        "models": {
          "type": "array",
          "items": { "type": "string" }
        }
      }
    }
  }
}
```

**Configuration Hierarchy**:
1. **Default**: `config/default.json` - Base configuration
2. **Variant**: `config/variants/{name}.json` - Preset overrides
3. **URL Params**: `?memory=1024M&ai=true` - Runtime overrides
4. **LocalStorage**: User preferences - Persistent overrides

**Merge Strategy**:
```javascript
const finalConfig = merge(
    defaultConfig,
    variantConfig,
    urlParamConfig,
    localStorageConfig
);
```

### 3. Storage Manager

**Location**: `src/core/storage-manager.js`

**Responsibilities**:
- Manage IndexedDB for virtual filesystem
- Handle disk image chunking and caching
- Implement virtual filesystem operations
- Persist VM state across sessions

**Database Schema**:
```javascript
// IndexedDB structure
databases: {
  'gitvmd-storage': {
    version: 1,
    stores: {
      'disk-chunks': { keyPath: 'id', indexes: ['imageId', 'chunkIndex'] },
      'vm-state': { keyPath: 'timestamp' },
      'user-files': { keyPath: 'path' },
      'cache-metadata': { keyPath: 'url' }
    }
  }
}
```

**Chunking Strategy**:
- Max chunk size: 50MB (below GitHub Pages 100MB limit)
- Chunk manifest with metadata
- Progressive loading based on access patterns
- LRU eviction for quota management

### 4. Asset Pipeline

**Location**: `scripts/`

**Build-Time Processing**:

1. **Image Chunking** (`chunk-images.js`):
```javascript
// Split disk images into <50MB chunks
input: images/alpine.img (200MB)
output:
  - images/alpine.img.chunk0 (50MB)
  - images/alpine.img.chunk1 (50MB)
  - images/alpine.img.chunk2 (50MB)
  - images/alpine.img.chunk3 (50MB)
  - images/alpine.img.manifest.json
```

2. **WASM Optimization** (`optimize-wasm.js`):
```javascript
// Compress and optimize WASM modules
- Brotli compression
- Dead code elimination
- Function splitting for lazy loading
```

3. **Config Generation** (`generate-configs.js`):
```javascript
// Generate runtime config from templates
- Inject build metadata
- Resolve asset URLs
- Validate against schema
```

### 5. AI Integration Layer

**Location**: `src/ai/`

**Architecture**:
```
┌─────────────────────────────────────┐
│       AI Worker (Dedicated)         │
│  ┌───────────────────────────────┐  │
│  │    Model Manager              │  │
│  │  - Load/Unload models         │  │
│  │  - Memory management          │  │
│  │  - Model registry             │  │
│  └───────────┬───────────────────┘  │
│              │                       │
│  ┌───────────▼───────────┐          │
│  │  Inference Backends   │          │
│  │  ┌─────┐ ┌─────┐     │          │
│  │  │ONNX │ │WebLLM│    │          │
│  │  │ RT  │ │      │    │          │
│  │  └─────┘ └─────┘     │          │
│  └───────────────────────┘          │
└─────────────────────────────────────┘
```

**Model Loading Strategy**:
```javascript
// Lazy loading configuration
models: {
  'code-completion': {
    url: '/models/starcoder-tiny.onnx',
    size: '150MB',
    loadStrategy: 'on-demand',
    unloadAfter: '5m-idle'
  },
  'llama-3.2-1b': {
    url: '/models/llama-3.2-1b-q4.onnx',
    size: '800MB',
    loadStrategy: 'manual',
    backend: 'webgpu'
  }
}
```

**Inference API**:
```javascript
// Unified inference interface
const aiService = await vm.getService('ai');

// Text generation
const response = await aiService.generate({
    model: 'llama-3.2-1b',
    prompt: 'Hello, world!',
    maxTokens: 100
});

// Code completion
const completion = await aiService.complete({
    model: 'code-completion',
    code: 'function fibonacci(',
    language: 'javascript'
});
```

### 6. UI Components

**Desktop Shell** (`src/ui/desktop-shell.js`):
- Window management
- Application launcher
- System tray
- Notifications

**Terminal Emulator** (`src/ui/terminal.js`):
- xterm.js integration
- Serial communication with VM
- Copy/paste support
- Custom themes

**File Manager** (`src/ui/file-manager.js`):
- Tree view and list view
- Drag-and-drop
- File upload/download
- Integration with virtual filesystem

---

## Variant System

### Variant Definition

Each variant is a JSON file that extends the base configuration:

**Minimal Variant** (`config/variants/minimal.json`):
```json
{
  "extends": "default",
  "name": "Minimal",
  "description": "Lightweight Alpine Linux environment",
  "vm": {
    "engine": "v86",
    "memory": "256M",
    "cpus": 1,
    "image": "alpine-minimal.img",
    "imageSize": "8MB",
    "network": false
  },
  "ui": {
    "theme": "light",
    "desktop": false,
    "terminal": true,
    "fileManager": false
  },
  "ai": {
    "enabled": false
  },
  "preinstalled": ["busybox", "sh"],
  "bootTime": "<3s",
  "memoryUsage": "~100MB"
}
```

**Developer Environment** (`config/variants/dev-env.json`):
```json
{
  "extends": "default",
  "name": "Developer Environment",
  "description": "Full-featured development environment",
  "vm": {
    "engine": "webcontainer",
    "memory": "1024M",
    "cpus": 2,
    "network": true
  },
  "ui": {
    "theme": "dark",
    "desktop": true,
    "terminal": true,
    "fileManager": true,
    "codeEditor": true
  },
  "ai": {
    "enabled": true,
    "backend": "webgpu",
    "models": ["code-completion", "documentation-gen"]
  },
  "preinstalled": [
    "nodejs", "npm", "git", "python3", "vim", "vscode-server"
  ],
  "features": {
    "gitIntegration": true,
    "packageManager": true,
    "debugger": true,
    "linter": true
  }
}
```

**AI Desktop** (`config/variants/ai-desktop.json`):
```json
{
  "extends": "default",
  "name": "AI Desktop",
  "description": "AI-powered virtual desktop",
  "vm": {
    "engine": "v86",
    "memory": "2048M",
    "cpus": 2,
    "image": "ubuntu-ai.img",
    "imageSize": "500MB",
    "network": true
  },
  "ui": {
    "theme": "auto",
    "desktop": true,
    "terminal": true,
    "fileManager": true,
    "aiAssistant": true
  },
  "ai": {
    "enabled": true,
    "backend": "webgpu",
    "models": [
      "llama-3.2-1b",
      "whisper-tiny",
      "stable-diffusion-turbo",
      "clip-vit"
    ],
    "autoload": ["llama-3.2-1b"],
    "features": {
      "voiceControl": true,
      "imageGeneration": true,
      "semanticSearch": true,
      "smartAssistant": true
    }
  },
  "preinstalled": [
    "python3", "jupyter", "ollama-compat"
  ]
}
```

### URL Parameter Mapping

```javascript
// URL to config mapping
const urlParams = new URLSearchParams(window.location.search);

const paramMapping = {
  'variant': (v) => loadVariant(v),
  'memory': (m) => ({ vm: { memory: m } }),
  'engine': (e) => ({ vm: { engine: e } }),
  'ai': (enabled) => ({ ai: { enabled: enabled === 'true' } }),
  'theme': (t) => ({ ui: { theme: t } }),
  'image': (img) => ({ vm: { image: img } })
};
```

**Examples**:
```
# Load developer variant
https://user.github.io/gitvmd/?variant=dev-env

# Minimal with 512MB RAM
https://user.github.io/gitvmd/?variant=minimal&memory=512M

# AI desktop with dark theme
https://user.github.io/gitvmd/?variant=ai-desktop&theme=dark

# Custom configuration
https://user.github.io/gitvmd/?engine=v86&memory=1024M&ai=true&image=ubuntu.img
```

---

## CI/CD Pipeline

### Build Workflow

```yaml
# .github/workflows/build-and-deploy.yml

name: Build and Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
  workflow_dispatch:

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Validate configs
        run: npm run validate:configs

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run type-check

  test:
    runs-on: ubuntu-latest
    needs: validate
    strategy:
      matrix:
        variant: [minimal, dev-env, ai-desktop]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Unit tests
        run: npm test

      - name: Integration tests (${{ matrix.variant }})
        run: npm run test:integration -- --variant=${{ matrix.variant }}

  build:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
        with:
          lfs: true  # For large assets

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Process disk images
        run: npm run build:images

      - name: Optimize assets
        run: npm run optimize

      - name: Build variants
        run: npm run build:variants

      - name: Build production bundle
        run: npm run build
        env:
          NODE_ENV: production

      - name: Generate metadata
        run: npm run generate:metadata

      - name: Validate build size
        run: |
          SIZE=$(du -sb dist | cut -f1)
          MAX_SIZE=$((1024 * 1024 * 1024))  # 1GB
          if [ $SIZE -gt $MAX_SIZE ]; then
            echo "Build exceeds 1GB limit: $(($SIZE / 1024 / 1024))MB"
            exit 1
          fi

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4

      - name: Validate deployment
        run: |
          curl -f ${{ steps.deployment.outputs.page_url }} || exit 1
```

### Optimization Workflow

```yaml
# .github/workflows/optimize-assets.yml

name: Optimize Assets

on:
  schedule:
    - cron: '0 2 * * 0'  # Weekly on Sunday
  workflow_dispatch:

jobs:
  optimize:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Optimize images
        run: |
          npm run optimize:images
          npm run chunk:images

      - name: Compress WASM
        run: npm run compress:wasm

      - name: Generate manifests
        run: npm run generate:manifests

      - name: Create PR
        uses: peter-evans/create-pull-request@v5
        with:
          commit-message: 'chore: optimize assets'
          title: 'Automated asset optimization'
          branch: optimize-assets
```

---

## Performance Budget

### Size Constraints

| Asset Type | Initial Load | Total (Lazy) | Notes |
|------------|-------------|--------------|-------|
| HTML/CSS | <100KB | <200KB | Critical rendering path |
| Core JS | <300KB | <1MB | VM engine + UI |
| WASM | <2MB | <10MB | v86 core + modules |
| BIOS/VGA | <256KB | <256KB | Required for boot |
| Disk Images | 0KB | <800MB | Loaded on-demand |
| AI Models | 0KB | <1GB+ | Lazy loaded, external CDN |
| **Total** | **<3MB** | **<1GB** | Fits GitHub Pages limit |

### Timing Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to Interactive | <3s | Lighthouse |
| VM Boot Time | <5s | Custom metric |
| First Paint | <1s | Web Vitals |
| First Contentful Paint | <1.5s | Web Vitals |
| Largest Contentful Paint | <2.5s | Web Vitals |

---

## Security Model

### Threat Model

**Assumptions**:
- Untrusted user code runs in VM
- Network requests may be malicious
- LocalStorage may be compromised

**Mitigations**:
1. **Browser Sandbox**: All code runs within browser security context
2. **CORS**: Strict cross-origin policies
3. **CSP**: Content Security Policy headers
4. **Input Validation**: Sanitize all user inputs
5. **Resource Limits**: CPU and memory quotas

### Content Security Policy

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'wasm-unsafe-eval';
  worker-src 'self' blob:;
  connect-src 'self' https://*.github.io https://cdn.jsdelivr.net;
  img-src 'self' data: blob:;
  style-src 'self' 'unsafe-inline';
  font-src 'self' data:;
  object-src 'none';
  base-uri 'self';
  form-action 'none';
  frame-ancestors 'none';
">
```

---

## Extension API

### Plugin Interface

```javascript
// Plugin contract
export class GitVMDPlugin {
    constructor(vm, config) {
        this.vm = vm;
        this.config = config;
    }

    // Lifecycle hooks
    async onInit() {}
    async onBoot() {}
    async onReady() {}
    async onShutdown() {}

    // Resource access
    async getFileSystem() { return this.vm.fs; }
    async getAIService() { return this.vm.ai; }
    async getStorage() { return this.vm.storage; }

    // UI integration
    registerMenuItem(item) { /* ... */ }
    registerKeybinding(binding) { /* ... */ }
    createWindow(options) { /* ... */ }
}
```

### Example Plugins

**SQLite Plugin**:
```javascript
class SQLitePlugin extends GitVMDPlugin {
    async onBoot() {
        const SQL = await initSqlJs({ /* wasm */ });
        this.db = new SQL.Database();

        this.registerMenuItem({
            label: 'Open SQL Console',
            action: () => this.openConsole()
        });
    }
}
```

**Git Integration Plugin**:
```javascript
class GitPlugin extends GitVMDPlugin {
    async onReady() {
        this.git = await import('isomorphic-git');

        this.vm.on('file-save', (path) => {
            this.autoCommit(path);
        });
    }
}
```

---

## Testing Strategy

### Test Pyramid

```
        ┌─────────────┐
        │     E2E     │  (10%)
        │   Tests     │
        ├─────────────┤
        │ Integration │  (30%)
        │   Tests     │
        ├─────────────┤
        │    Unit     │  (60%)
        │   Tests     │
        └─────────────┘
```

### Unit Tests
- VM engine abstraction
- Configuration merging
- Storage manager
- Chunking algorithms
- UI components

### Integration Tests
- VM boot sequence
- File operations
- Network communication
- AI inference pipeline
- Plugin loading

### E2E Tests
```javascript
describe('Variant Loading', () => {
    test('minimal variant boots successfully', async () => {
        await page.goto('/?variant=minimal');
        await page.waitForSelector('.terminal-ready');

        const bootTime = await page.evaluate(() =>
            performance.getEntriesByName('vm-boot')[0].duration
        );

        expect(bootTime).toBeLessThan(5000);
    });
});
```

---

## Deployment Strategy

### Branching Model

```
main ──────────●────────●────────●──────> (production)
               │        │        │
develop ───●───●────●───●────●───●────●─> (staging)
           │        │        │
feature/ai │        │        │
    ───────●        │        │
                    │        │
feature/ui          │        │
    ────────────────●        │
                             │
fix/boot-issue               │
    ─────────────────────────●
```

### Environments

| Environment | Branch | URL | Purpose |
|-------------|--------|-----|---------|
| Production | `main` | `user.github.io/gitvmd` | Stable release |
| Staging | `develop` | `user.github.io/gitvmd-staging` | Pre-release testing |
| Preview | `feature/*` | `preview-*.pages.dev` | Feature testing |

---

## Monitoring & Analytics

### Performance Monitoring

```javascript
// Custom metrics
performance.mark('vm-init-start');
// ... VM initialization
performance.mark('vm-init-end');
performance.measure('vm-init', 'vm-init-start', 'vm-init-end');

// Report to analytics
const metrics = {
    vmBoot: performance.getEntriesByName('vm-boot')[0].duration,
    firstInteraction: performance.getEntriesByName('first-interaction')[0].duration,
    memoryUsage: performance.memory?.usedJSHeapSize,
    variant: config.name
};

// Privacy-preserving analytics (no PII)
sendToAnalytics(metrics);
```

### Error Tracking

```javascript
window.addEventListener('error', (event) => {
    logError({
        message: event.message,
        stack: event.error?.stack,
        variant: currentVariant,
        browser: navigator.userAgent,
        timestamp: Date.now()
    });
});
```

---

## Future Enhancements

### Roadmap

**v1.0** (MVP)
- ✅ v86 integration
- ✅ Configuration system
- ✅ Basic variants (minimal, dev)
- ✅ CI/CD pipeline

**v1.1** (AI Integration)
- ⬜ ONNX Runtime Web
- ⬜ WebLLM integration
- ⬜ AI variant
- ⬜ Model marketplace

**v1.2** (Collaboration)
- ⬜ WebRTC screen sharing
- ⬜ Multi-user support
- ⬜ Shared workspaces
- ⬜ Real-time sync

**v2.0** (Advanced Features)
- ⬜ WebGPU rendering
- ⬜ 3D desktop environment
- ⬜ Container support
- ⬜ Native app compatibility

---

## Conclusion

This architecture provides:

1. **Flexibility**: Multiple VM engines and configurations
2. **Performance**: Optimized for GitHub Pages constraints
3. **Extensibility**: Plugin system for custom features
4. **Maintainability**: Clear separation of concerns
5. **Scalability**: Progressive loading and chunking
6. **Modern**: Leverages latest web technologies
7. **AI-Ready**: Built-in support for on-device inference

The design balances ambition with pragmatism, delivering a production-ready system that can run entirely on free GitHub Pages infrastructure while providing advanced features like AI integration and full OS emulation.
