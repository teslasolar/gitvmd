# GitVMD Quick Start

Get started with GitVMD in 60 seconds!

## 1️⃣ Visit the Site

```
https://yoursite.github.io/gitvmd/
```

You'll see the boot screen with 4 operating systems.

## 2️⃣ Choose Your Environment

### 🏭 **SCADA/HMI** (Recommended for Industrial Automation)
- **Click**: The featured blue card
- **Boot**: Instant
- **Apps**: Plant Overview, Process Detail, Alarms, Trends

### 💻 **Minimal OS** (Learning Linux)
- **Click**: Gray card on left
- **Boot**: 3 seconds
- **Apps**: Terminal, File Browser

### 👨‍💻 **Developer** (Web Development)
- **Click**: Developer card
- **Boot**: 5 seconds
- **Apps**: Terminal, Code Editor, Git, NPM

### 🤖 **AI Desktop** (AI Experiments)
- **Click**: AI card on right
- **Boot**: 10 seconds
- **Apps**: Chatbot (Llama 3.2), Image Gen, Voice

## 3️⃣ Desktop Loads

You'll see:
- **Taskbar** at top
- **Desktop icons** in workspace
- **Status bar** at bottom

## 4️⃣ Launch an App

- Click any **desktop icon**
- Window opens with app
- Click more icons for multiple windows

## 5️⃣ Try SCADA (Quickest Demo)

1. Click **🏭 SCADA/HMI** card
2. Desktop loads instantly
3. Click **🏭 Plant Overview** icon
4. See industrial HMI interface
5. Click **📊 Process Detail** icon
6. See P&ID diagram

Both windows visible at once!

## Direct URLs (Skip Boot Screen)

```bash
# SCADA/HMI
https://yoursite.github.io/gitvmd/?os=scada

# Minimal
https://yoursite.github.io/gitvmd/?os=minimal

# Developer
https://yoursite.github.io/gitvmd/?os=dev-env

# AI Desktop
https://yoursite.github.io/gitvmd/?os=ai-desktop
```

## Common Actions

| Action | How |
|--------|-----|
| Open app | Click desktop icon |
| Move window | Drag title bar |
| Close window | Click ✕ button |
| Shutdown | Menu → Shutdown |
| Return to boot | Refresh page |

## For Developers

### Clone Repository
```bash
git clone https://github.com/yourusername/gitvmd.git
cd gitvmd
```

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Deploy to GitHub Pages
```bash
git add .
git commit -m "Update"
git push
```

GitHub Actions automatically deploys!

## Architecture Overview

- **13 Components**: Modular, <250 tokens each
- **5 OS Variants**: Minimal, Dev, SCADA, AI, Desktop base
- **4 Views**: Overview, Process Detail, + more
- **3 Core Systems**: View loader, Component registry, Boot loader

## File Structure

```
public/index.html         ← Entry point
public/js/boot.js         ← Boot loader
views/os/*.json           ← OS definitions
components/*/*.json       ← Reusable components
```

## What's Included

✅ OS boot screen
✅ 4 complete OS variants
✅ Desktop environment
✅ Window management
✅ 13 SCADA components
✅ ISA-95/ISA-88 compliance
✅ CI/CD pipeline
✅ Complete documentation

## Next Steps

1. ✅ Try all 4 OS variants
2. 📖 Read [NAVIGATION_GUIDE.md](NAVIGATION_GUIDE.md)
3. 🏭 Explore [SCADA_ARCHITECTURE.md](SCADA_ARCHITECTURE.md)
4. 🧩 Browse [components/](components/)
5. 🛠️ Create custom OS variant

## Support

- 📚 **Documentation**: [README.md](README.md)
- 🏗️ **Architecture**: [ARCHITECTURE.md](ARCHITECTURE.md)
- 📊 **Components**: [docs/PERSPECTIVE_COMPONENTS.md](docs/PERSPECTIVE_COMPONENTS.md)
- 🗺️ **Navigation**: [NAVIGATION_GUIDE.md](NAVIGATION_GUIDE.md)

## Cost

**$0/month** - Runs on free GitHub Pages!

---

**Ready in 60 seconds. Enterprise features. Zero cost.**
