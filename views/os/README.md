# OS Templates

Navigable operating system environments for GitVMD.

## Available OS Variants

### 1. Minimal OS (`minimal.json`)
- **Base**: Alpine Linux
- **Size**: 8MB
- **Memory**: 256MB
- **Boot Time**: <3s
- **Engine**: v86
- **Apps**: Terminal, File Browser

**Use Case**: Lightweight scripting, learning Linux basics

### 2. Developer Environment (`dev-env.json`)
- **Base**: WebContainer
- **Size**: 100MB
- **Memory**: 1GB
- **Boot Time**: <5s
- **Engine**: WebContainer
- **Apps**: Terminal, Code Editor, File Browser, Git, NPM

**Use Case**: Web development, Node.js projects

### 3. SCADA/HMI (`scada.json`)
- **Base**: Web-only
- **Size**: Instant
- **Memory**: 512MB
- **Boot Time**: Instant
- **Engine**: Web-only (no VM)
- **Apps**: Plant Overview, Process Detail, Alarms, Trends, Tag Browser

**Use Case**: Industrial automation HMI/SCADA monitoring

### 4. AI Desktop (`ai-desktop.json`)
- **Base**: Ubuntu
- **Size**: 500MB
- **Memory**: 2GB
- **Boot Time**: <10s
- **Engine**: v86
- **Apps**: AI Chatbot, Image Generator, Voice Control, Code Assistant, Terminal
- **AI Models**: Llama 3.2 1B, Whisper Tiny, Stable Diffusion Turbo

**Use Case**: AI experimentation, generative AI applications

## Navigation

### From Index
Visit the index page to see the OS selector with all 4 variants.

### Direct Boot
```
https://yoursite.github.io/gitvmd/?os=minimal
https://yoursite.github.io/gitvmd/?os=dev-env
https://yoursite.github.io/gitvmd/?os=scada
https://yoursite.github.io/gitvmd/?os=ai-desktop
```

### Legacy URL Support
```
https://yoursite.github.io/gitvmd/?variant=minimal
```

## Desktop Environment

Each OS boots into a full desktop environment with:

- **Taskbar**: Logo, menu (Applications, Settings, Shutdown)
- **Workspace**: Desktop icons or VM screen
- **Status Bar**: OS name, status, CPU/memory usage, clock

## Window System

- Draggable windows
- Title bar with controls (minimize, maximize, close)
- Multiple windows supported
- Click desktop icons to launch apps

## Applications

### Built-in Apps

| App | Description | Available In |
|-----|-------------|--------------|
| Terminal | Command-line interface | All |
| File Browser | Navigate filesystem | Minimal, Dev |
| Code Editor | Edit code files | Dev |
| Git | Version control | Dev |
| NPM | Package manager | Dev |
| Tag Browser | Browse OPC/MQTT tags | SCADA |
| Plant Overview | Factory overview HMI | SCADA |
| Process Detail | P&ID diagrams | SCADA |
| Alarms | Alarm management | SCADA |
| Trends | Historical data charts | SCADA |
| AI Chatbot | LLM conversation | AI Desktop |
| Image Generator | Stable Diffusion UI | AI Desktop |
| Voice Control | Speech interface | AI Desktop |
| Code Assistant | AI code completion | AI Desktop |

## File Format

Each OS variant is defined as a JSON file:

```json
{
  "meta": {
    "name": "OS Name",
    "type": "os.variant",
    "base": "alpine|ubuntu|webcontainer|web",
    "size": "8MB",
    "bootTime": "3s"
  },
  "config": {
    "vm": {
      "engine": "v86|webcontainer|web-only",
      "memory": "256M",
      "image": "os-image.img"
    },
    "apps": [
      {
        "name": "App Name",
        "icon": "emoji or name",
        "exec": "app-command"
      }
    ]
  },
  "boot": {
    "autostart": true,
    "splash": true,
    "timeout": 10000
  }
}
```

## App Execution Commands

| Command | Description |
|---------|-------------|
| `os.terminal` | Launch terminal |
| `os.files` | Launch file browser |
| `os.editor` | Launch code editor |
| `os.git` | Launch Git UI |
| `os.npm` | Launch NPM UI |
| `os.tagbrowser` | Launch tag browser |
| `view:viewname` | Load SCADA view |
| `ai.chatbot` | Launch AI chatbot |
| `ai.imagegen` | Launch image generator |
| `ai.voice` | Launch voice control |
| `ai.codeassist` | Launch code assistant |

## Creating Custom OS Variants

1. Create new JSON file in `views/os/`
2. Define metadata and configuration
3. Add apps with execution commands
4. Update index.html OS selector (optional)
5. Access via `?os=yourvariant`

## Integration

The OS system integrates with:

- **VM Engines**: v86, WebContainers
- **SCADA Components**: All Perspective components
- **AI Models**: ONNX Runtime, WebLLM
- **Tag Providers**: WebSocket, MQTT, OPC UA

## GitHub Pages Deployment

All OS variants run purely from static files on GitHub Pages:

- HTML/CSS/JavaScript only
- No server-side processing
- Offline-capable with Service Workers
- <1GB total size compliant

---

**Navigate to any OS from the index.html boot screen!**
