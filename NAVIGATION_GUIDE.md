# GitVMD Navigation Guide

## Visual Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    index.html (Boot Screen)                  │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────┐│
│  │ 💻 Minimal │  │👨‍💻 Developer│  │🏭 SCADA/HMI│  │🤖 AI   ││
│  │            │  │            │  │            │  │Desktop ││
│  │   8MB      │  │   100MB    │  │  Web-based │  │ 500MB+ ││
│  │  256MB RAM │  │   1GB RAM  │  │  512MB RAM │  │  2GB   ││
│  │  <3s boot  │  │  <5s boot  │  │  Instant   │  │ <10s   ││
│  │            │  │            │  │            │  │        ││
│  │ [Launch] ──┼──┼─[Launch] ──┼──┼─[Launch*]──┼──┼[Launch]││
│  └────────────┘  └────────────┘  └────────────┘  └────────┘│
│                                       *Featured              │
└──────────────┬───────────────────────────────────────────────┘
               │
               │ Click Launch or Use URL
               │ ?os=minimal | ?os=dev-env | ?os=scada | ?os=ai-desktop
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Desktop Environment                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Taskbar: [GitVMD] [Applications▼] [Settings] [Shutdown]│
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Workspace (Desktop Icons or VM Screen)               │  │
│  │                                                       │  │
│  │  📱 App 1    📱 App 2    📱 App 3                    │  │
│  │                                                       │  │
│  │  📱 App 4    📱 App 5    📱 App 6                    │  │
│  │                                                       │  │
│  │                                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Status: [OS Name] [Ready] │ CPU: 0% │ MEM: 0MB │ 12:00││
│  └──────────────────────────────────────────────────────┘  │
└──────────────┬───────────────────────────────────────────────┘
               │
               │ Click Desktop Icon
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Window                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Title Bar: [App Name]              [─] [□] [✕]      │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │                                                       │  │
│  │  Window Content:                                     │  │
│  │  - Terminal (command line)                           │  │
│  │  - SCADA View (P&ID diagram)                         │  │
│  │  - AI Interface (chatbot)                            │  │
│  │  - Code Editor                                       │  │
│  │                                                       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## URL Navigation

### Boot Directly to OS

```bash
# Minimal OS (Alpine Linux Terminal)
https://yoursite.github.io/gitvmd/?os=minimal

# Developer Environment (Node.js, Git, Python)
https://yoursite.github.io/gitvmd/?os=dev-env

# SCADA/HMI (Industrial Automation)
https://yoursite.github.io/gitvmd/?os=scada

# AI Desktop (LLM, Image Gen, Voice)
https://yoursite.github.io/gitvmd/?os=ai-desktop
```

### Legacy Variant Support

```bash
# Also works with "variant" parameter
https://yoursite.github.io/gitvmd/?variant=minimal
```

---

## Navigation Hierarchy

```
index.html
│
├─ OS Selector (Boot Screen)
│  │
│  ├─ Minimal OS
│  │  └─ Desktop
│  │     ├─ Terminal App
│  │     └─ File Browser App
│  │
│  ├─ Developer Environment
│  │  └─ Desktop
│  │     ├─ Terminal App
│  │     ├─ Code Editor App
│  │     ├─ File Browser App
│  │     ├─ Git App
│  │     └─ NPM App
│  │
│  ├─ SCADA/HMI ⭐
│  │  └─ Desktop
│  │     ├─ Plant Overview (view:overview)
│  │     ├─ Process Detail (view:process-detail)
│  │     ├─ Alarms (view:alarms)
│  │     ├─ Trends (view:trends)
│  │     └─ Tag Browser (os.tagbrowser)
│  │
│  └─ AI Desktop
│     └─ Desktop
│        ├─ AI Chatbot (ai.chatbot)
│        ├─ Image Generator (ai.imagegen)
│        ├─ Voice Control (ai.voice)
│        ├─ Code Assistant (ai.codeassist)
│        └─ Terminal (os.terminal)
```

---

## OS Variant Specifications

| OS | Engine | Memory | Size | Boot | Apps |
|----|--------|--------|------|------|------|
| **Minimal** | v86 | 256MB | 8MB | 3s | 2 |
| **Developer** | WebContainer | 1GB | 100MB | 5s | 5 |
| **SCADA** | Web-only | 512MB | Instant | 0s | 5 |
| **AI Desktop** | v86 | 2GB | 500MB+ | 10s | 5 |

---

## Application Types

### System Apps (`os.*`)
| Command | App | Description |
|---------|-----|-------------|
| `os.terminal` | Terminal | Command-line interface |
| `os.files` | File Browser | Navigate filesystem |
| `os.editor` | Code Editor | Edit code files |
| `os.git` | Git UI | Version control |
| `os.npm` | NPM UI | Package manager |
| `os.tagbrowser` | Tag Browser | Browse OPC/MQTT tags |

### View Apps (`view:*`)
| Command | View | Description |
|---------|------|-------------|
| `view:overview` | Plant Overview | Factory HMI overview |
| `view:process-detail` | Process Detail | P&ID diagrams |
| `view:alarms` | Alarms | Alarm management |
| `view:trends` | Trends | Historical charts |

### AI Apps (`ai.*`)
| Command | App | Description |
|---------|-----|-------------|
| `ai.chatbot` | AI Chatbot | LLM conversation (Llama 3.2) |
| `ai.imagegen` | Image Generator | Stable Diffusion UI |
| `ai.voice` | Voice Control | Speech interface (Whisper) |
| `ai.codeassist` | Code Assistant | AI code completion |

---

## User Journey Examples

### Example 1: SCADA Operator
1. Visit `https://yoursite.github.io/gitvmd/`
2. Click **🏭 SCADA/HMI** card
3. Desktop loads with 5 icons
4. Click **📊 Plant Overview**
5. View opens in window with live process data
6. Click **🔔 Alarms** to check alarms
7. Both windows visible simultaneously

### Example 2: Developer
1. Visit `https://yoursite.github.io/gitvmd/?os=dev-env`
2. Desktop loads immediately
3. Click **💻 Terminal**
4. Run `npm install` in terminal
5. Click **📝 Code Editor**
6. Edit files in code window
7. Terminal and editor both open

### Example 3: AI Experimentation
1. Visit `https://yoursite.github.io/gitvmd/?os=ai-desktop`
2. Wait ~10s for boot
3. Click **🤖 AI Chatbot**
4. Chat with Llama 3.2 1B model
5. Click **🎨 Image Generator**
6. Generate images with Stable Diffusion
7. All processing happens locally in browser

---

## File Organization

```
gitvmd/
├── public/                    # GitHub Pages root
│   ├── index.html            # Boot screen (OS selector)
│   ├── js/
│   │   ├── boot.js           # Boot loader & desktop environment
│   │   ├── main.js           # Main application logic
│   │   └── vm-engine.js      # VM abstraction layer
│   └── styles/
│       ├── main.css          # Base styles
│       └── os.css            # OS/desktop styles
│
├── views/                     # View definitions
│   ├── os/                   # OS variants
│   │   ├── minimal.json      # Minimal OS config
│   │   ├── dev-env.json      # Developer OS config
│   │   ├── scada.json        # SCADA OS config
│   │   ├── ai-desktop.json   # AI Desktop config
│   │   └── desktop.json      # Base desktop template
│   ├── overview.json         # SCADA: Plant overview
│   └── process-detail.json   # SCADA: Process detail
│
└── components/                # Reusable components
    ├── symbols/              # ISA-5.1 symbols
    ├── chart/                # Charts & gauges
    ├── input/                # Input controls
    ├── display/              # Display components
    └── container/            # Layout containers
```

---

## Desktop Environment Features

### Taskbar
- **Logo**: GitVMD branding
- **Menu**: Applications, Settings, Shutdown
- **Always Visible**: Stays at top

### Workspace
- **Desktop Icons**: Grid layout, click to launch
- **VM Screen**: For v86/WebContainer OS variants
- **Multiple Windows**: Overlapping window support

### Status Bar
- **Left**: OS name, status messages
- **Right**: CPU usage, memory usage, clock
- **Live Updates**: Clock updates every second

### Windows
- **Draggable**: Click title bar to drag
- **Controls**: Minimize, maximize, close buttons
- **Resizable**: (Future feature)
- **Multiple**: Open many windows simultaneously

---

## Navigation Flow Summary

1. **Entry Point**: `index.html` (boot screen)
2. **OS Selection**: Click card or use `?os=variant` URL
3. **Boot Process**: Loading animation → Desktop loads
4. **Desktop**: Taskbar + Icons + Status bar
5. **Launch App**: Click icon → Window opens
6. **Multi-Window**: Open multiple apps at once
7. **Shutdown**: Menu → Shutdown → Reload page

---

## Quick Reference

| What | How |
|------|-----|
| **Open GitVMD** | Visit `index.html` |
| **Select OS** | Click card on boot screen |
| **Direct Boot** | Use `?os=variant` in URL |
| **Launch App** | Click desktop icon |
| **Open Window** | Icon click → window appears |
| **Move Window** | Drag title bar |
| **Close Window** | Click ✕ button |
| **Shutdown OS** | Taskbar menu → Shutdown |
| **Return to Boot** | Refresh page |

---

**Navigate anywhere from the index.html boot screen!**

All 4 OS variants + Desktop environments + Applications accessible with one click.
