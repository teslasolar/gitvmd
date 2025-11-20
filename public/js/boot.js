/**
 * GitVMD Boot Loader
 * Handles OS selection and initialization
 */

class BootLoader {
    constructor() {
        this.currentOS = null;
        this.osConfigs = new Map();
    }

    async init() {
        console.log('GitVMD Boot Loader v1.0.0');

        // Check URL parameters
        const params = new URLSearchParams(window.location.search);
        const autoboot = params.get('os') || params.get('variant');

        if (autoboot) {
            await this.bootOS(autoboot);
        }
    }

    async bootOS(osType) {
        console.log(`Booting ${osType}...`);

        try {
            // Show loading
            this.showBootProgress(osType);

            // Load OS configuration
            const config = await this.loadOSConfig(osType);

            // Initialize based on type
            if (config.meta.base === 'web') {
                await this.bootWebOS(config);
            } else {
                await this.bootVMOS(config);
            }

            // Hide boot screen
            this.hideBootScreen();

        } catch (error) {
            console.error('Boot failed:', error);
            this.showBootError(error);
        }
    }

    async loadOSConfig(osType) {
        // Detect base path from current location
        const basePath = window.location.pathname.includes('/gitvmd/') ? '/gitvmd' : '';

        // Try multiple paths for GitHub Pages compatibility
        const paths = [
            `${basePath}/views/os/${osType}.json`,
            `../views/os/${osType}.json`,
            `../../views/os/${osType}.json`,
            `/views/os/${osType}.json`
        ];

        console.log(`Loading OS config for: ${osType}`);
        console.log(`Detected base path: ${basePath}`);

        for (const path of paths) {
            try {
                console.log(`Trying path: ${path}`);
                const response = await fetch(path);
                if (response.ok) {
                    console.log(`✓ Loaded from: ${path}`);
                    return await response.json();
                }
            } catch (e) {
                console.log(`✗ Failed: ${path}`);
            }
        }

        throw new Error(`OS config not found: ${osType}`);
    }

    async bootWebOS(config) {
        console.log('Booting Web-based OS...');

        // Load desktop environment
        const desktop = await this.createDesktop(config);

        // Mount to DOM
        const container = document.getElementById('os-container');
        container.innerHTML = '';
        container.appendChild(desktop);

        // Initialize applications
        await this.initializeApps(config.config.apps);

        this.currentOS = config;
    }

    async bootVMOS(config) {
        console.log('Booting VM-based OS...');

        // Import VM engine
        const { VMEngine } = await import('./vm-engine.js');

        // Create VM instance
        const vm = new VMEngine(config.config.vm);

        // Create desktop with embedded VM
        const desktop = await this.createDesktop(config, vm);

        // Mount to DOM
        const container = document.getElementById('os-container');
        container.innerHTML = '';
        container.appendChild(desktop);

        // Boot VM
        await vm.boot();

        this.currentOS = config;
    }

    createDesktop(config, vm = null) {
        const desktop = document.createElement('div');
        desktop.className = 'os-desktop';

        // Taskbar
        const taskbar = this.createTaskbar(config);
        desktop.appendChild(taskbar);

        // Workspace
        const workspace = document.createElement('div');
        workspace.className = 'os-workspace';
        workspace.id = 'workspace';

        // Add desktop icons or VM screen
        if (vm) {
            const vmScreen = document.createElement('div');
            vmScreen.id = 'vm-screen';
            workspace.appendChild(vmScreen);
        } else {
            const icons = this.createDesktopIcons(config.config.apps);
            workspace.appendChild(icons);
        }

        desktop.appendChild(workspace);

        // Status bar
        const statusbar = this.createStatusBar(config);
        desktop.appendChild(statusbar);

        return desktop;
    }

    createTaskbar(config) {
        const taskbar = document.createElement('div');
        taskbar.className = 'os-taskbar';

        taskbar.innerHTML = `
            <div class="logo">GitVMD</div>
            <div class="menu">
                <div class="menu-item" onclick="app.showApplications()">Applications</div>
                <div class="menu-item" onclick="app.showSettings()">Settings</div>
                <div class="menu-item" onclick="app.shutdown()">Shutdown</div>
            </div>
        `;

        return taskbar;
    }

    createDesktopIcons(apps) {
        const container = document.createElement('div');
        container.className = 'os-desktop-icons';

        apps.forEach(app => {
            const icon = document.createElement('div');
            icon.className = 'desktop-icon';
            icon.innerHTML = `
                <div class="icon">${this.getIconEmoji(app.icon)}</div>
                <div class="label">${app.name}</div>
            `;
            icon.onclick = () => this.launchApp(app);
            container.appendChild(icon);
        });

        return container;
    }

    createStatusBar(config) {
        const statusbar = document.createElement('div');
        statusbar.className = 'os-statusbar';

        const now = new Date();
        statusbar.innerHTML = `
            <div class="status-left">
                <span>${config.meta.name}</span>
                <span id="status-msg">Ready</span>
            </div>
            <div class="status-right">
                <span id="cpu-usage">CPU: 0%</span>
                <span id="mem-usage">MEM: 0MB</span>
                <span id="clock">${now.toLocaleTimeString()}</span>
            </div>
        `;

        // Update clock
        setInterval(() => {
            const clockEl = document.getElementById('clock');
            if (clockEl) {
                clockEl.textContent = new Date().toLocaleTimeString();
            }
        }, 1000);

        return statusbar;
    }

    async launchApp(app) {
        console.log('Launching app:', app.name);

        if (app.exec.startsWith('view:')) {
            const viewName = app.exec.split(':')[1];
            await this.openView(viewName);
        } else if (app.exec.startsWith('os.')) {
            const osApp = app.exec.split('.')[1];
            await this.openOSApp(osApp);
        }
    }

    async openView(viewName) {
        const { ViewLoader } = await import('./view-loader.js');
        const loader = new ViewLoader('/views');

        const windowEl = this.createWindow(viewName);
        const contentEl = windowEl.querySelector('.window-content');

        await loader.renderView(viewName, contentEl);

        document.getElementById('workspace').appendChild(windowEl);
    }

    async openOSApp(appName) {
        const windowEl = this.createWindow(this.formatAppName(appName));
        const contentEl = windowEl.querySelector('.window-content');

        // Initialize shared filesystem if not exists
        if (!window.globalFileSystem) {
            window.globalFileSystem = this.initFileSystem();
        }

        switch(appName) {
            case 'terminal':
                const { Terminal } = await import('./apps/terminal.js');
                new Terminal(contentEl);
                break;

            case 'files':
                const { FileBrowser } = await import('./apps/file-browser.js');
                new FileBrowser(contentEl, window.globalFileSystem);
                break;

            // Developer tools
            case 'editor':
                contentEl.innerHTML = this.createPlaceholder('Code Editor', '📝',
                    'Monaco-based code editor with syntax highlighting');
                break;

            case 'git':
                contentEl.innerHTML = this.createPlaceholder('Git Client', '💾',
                    'Visual Git interface for commits, branches, and history');
                break;

            case 'packages':
                contentEl.innerHTML = this.createPlaceholder('Package Manager', '📦',
                    'Manage npm, pip, and other package dependencies');
                break;

            case 'ai':
                contentEl.innerHTML = this.createPlaceholder('AI Assistant', '🤖',
                    'Code completion, refactoring, and chat assistance');
                break;

            case 'devtools':
                contentEl.innerHTML = this.createPlaceholder('Browser DevTools', '🔧',
                    'Inspect elements, console, network monitoring');
                break;

            case 'rest':
                contentEl.innerHTML = this.createPlaceholder('REST Client', '🌐',
                    'Test API endpoints and view responses');
                break;

            // SCADA apps
            case 'tagbrowser':
                contentEl.innerHTML = this.createPlaceholder('Tag Browser', '🗄️',
                    'Browse and configure OPC tags');
                break;

            case 'recipes':
                contentEl.innerHTML = this.createPlaceholder('Recipe Manager', '📋',
                    'Batch recipes and production procedures (ISA-88)');
                break;

            case 'reports':
                contentEl.innerHTML = this.createPlaceholder('Reports', '📊',
                    'Production reports and KPIs');
                break;

            case 'users':
                contentEl.innerHTML = this.createPlaceholder('User Management', '⚙️',
                    'User roles and permissions (ISA-95 security)');
                break;

            // AI Desktop apps
            case 'chat':
                contentEl.innerHTML = this.createPlaceholder('AI Chat', '🤖',
                    'Conversational AI assistant powered by WebLLM');
                break;

            case 'imagegen':
                contentEl.innerHTML = this.createPlaceholder('Image Generator', '🎨',
                    'Text-to-image generation with Stable Diffusion');
                break;

            case 'tts':
                contentEl.innerHTML = this.createPlaceholder('Voice Synthesis', '🎙️',
                    'Text-to-speech with multiple voices');
                break;

            case 'stt':
                contentEl.innerHTML = this.createPlaceholder('Speech Recognition', '🎤',
                    'Speech-to-text transcription');
                break;

            case 'ml':
                contentEl.innerHTML = this.createPlaceholder('ML Playground', '🧪',
                    'Train and test machine learning models');
                break;

            case 'vision':
                contentEl.innerHTML = this.createPlaceholder('Vision AI', '👁️',
                    'Image classification, object detection, OCR');
                break;

            case 'codeai':
                contentEl.innerHTML = this.createPlaceholder('Code Assistant', '💡',
                    'AI-powered code generation and debugging');
                break;

            default:
                contentEl.innerHTML = this.createPlaceholder(appName, '📱',
                    'Application coming soon');
        }

        document.getElementById('workspace').appendChild(windowEl);
    }

    createPlaceholder(title, icon, description) {
        return `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 40px; text-align: center;">
                <div style="font-size: 64px; margin-bottom: 20px;">${icon}</div>
                <h2 style="margin-bottom: 10px; color: #333;">${title}</h2>
                <p style="color: #666; line-height: 1.6; max-width: 400px;">${description}</p>
                <div style="margin-top: 20px; padding: 12px 24px; background: #f0f0f0; border-radius: 6px; font-size: 14px; color: #888;">
                    This application is available in the full version
                </div>
            </div>
        `;
    }

    formatAppName(appName) {
        return appName
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    initFileSystem() {
        return {
            '/': {
                type: 'dir',
                contents: {
                    'home': {
                        type: 'dir',
                        contents: {
                            'guest': {
                                type: 'dir',
                                contents: {
                                    'README.md': {
                                        type: 'file',
                                        content: 'Welcome to GitVMD!\n\nThis is a browser-based virtual desktop running on GitHub Pages.\n\nFeatures:\n- Terminal emulator\n- File browser\n- SCADA/HMI system\n- AI integration\n\nType "help" in the terminal for available commands.'
                                    },
                                    'projects': { type: 'dir', contents: {} }
                                }
                            }
                        }
                    },
                    'usr': {
                        type: 'dir',
                        contents: {
                            'bin': { type: 'dir', contents: {} },
                            'lib': { type: 'dir', contents: {} }
                        }
                    },
                    'etc': { type: 'dir', contents: {} },
                    'tmp': { type: 'dir', contents: {} }
                }
            }
        };
    }

    createWindow(title) {
        const win = document.createElement('div');
        win.className = 'os-window';

        // Random positioning with some offset
        const offset = document.querySelectorAll('.os-window').length * 30;
        win.style.left = (100 + offset) + 'px';
        win.style.top = (80 + offset) + 'px';
        win.style.width = '700px';
        win.style.height = '500px';

        win.innerHTML = `
            <div class="window-titlebar">
                <div class="window-title">${title}</div>
                <div class="window-controls">
                    <div class="window-control minimize" onclick="window.minimizeWindow(this)">−</div>
                    <div class="window-control maximize" onclick="window.maximizeWindow(this)">□</div>
                    <div class="window-control close" onclick="this.closest('.os-window').remove()">×</div>
                </div>
            </div>
            <div class="window-content"></div>
        `;

        this.makeWindowDraggable(win);
        this.makeWindowResizable(win);

        // Bring to front on click
        win.addEventListener('mousedown', () => {
            document.querySelectorAll('.os-window').forEach(w => w.style.zIndex = '1000');
            win.style.zIndex = '1001';
        });

        return win;
    }

    makeWindowResizable(win) {
        // Add resize handle
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'window-resize-handle';
        win.appendChild(resizeHandle);

        let isResizing = false;
        let startX, startY, startWidth, startHeight;

        resizeHandle.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = parseInt(win.style.width);
            startHeight = parseInt(win.style.height);
            e.stopPropagation();
        });

        document.addEventListener('mousemove', (e) => {
            if (isResizing) {
                const width = startWidth + (e.clientX - startX);
                const height = startHeight + (e.clientY - startY);
                win.style.width = Math.max(400, width) + 'px';
                win.style.height = Math.max(300, height) + 'px';
            }
        });

        document.addEventListener('mouseup', () => {
            isResizing = false;
        });
    }

    makeWindowDraggable(win) {
        const titlebar = win.querySelector('.window-titlebar');
        let isDragging = false;
        let currentX, currentY, initialX, initialY;

        titlebar.addEventListener('mousedown', (e) => {
            isDragging = true;
            initialX = e.clientX - win.offsetLeft;
            initialY = e.clientY - win.offsetTop;
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                win.style.left = currentX + 'px';
                win.style.top = currentY + 'px';
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }


    getIconEmoji(iconName) {
        const icons = {
            'terminal': '💻',
            'folder': '📁',
            'factory': '🏭',
            'chart': '📊',
            'bell': '🔔',
            'trending': '📈',
            'database': '🗄️',
            'settings': '⚙️'
        };
        return icons[iconName] || '📄';
    }

    showBootProgress(osType) {
        const bootScreen = document.getElementById('boot-screen');
        const selector = bootScreen.querySelector('.os-selector');

        selector.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <h2 style="margin-top: 20px;">Booting ${osType}...</h2>
                <p>Initializing environment...</p>
            </div>
        `;
    }

    hideBootScreen() {
        const bootScreen = document.getElementById('boot-screen');
        const app = document.getElementById('app');

        bootScreen.classList.add('hidden');
        app.classList.remove('hidden');
    }

    showBootError(error) {
        alert(`Boot failed: ${error.message}`);
        location.reload();
    }

    async initializeApps(apps) {
        console.log('Initialized apps:', apps.map(a => a.name).join(', '));
    }
}

// Global boot function
window.bootOS = async function(osType) {
    const loader = new BootLoader();
    await loader.bootOS(osType);
};

// Global window management functions
window.minimizeWindow = function(btn) {
    const win = btn.closest('.os-window');
    win.style.display = 'none';
    // TODO: Add to taskbar
};

window.maximizeWindow = function(btn) {
    const win = btn.closest('.os-window');
    if (win.dataset.maximized === 'true') {
        win.style.left = win.dataset.oldLeft;
        win.style.top = win.dataset.oldTop;
        win.style.width = win.dataset.oldWidth;
        win.style.height = win.dataset.oldHeight;
        win.dataset.maximized = 'false';
    } else {
        win.dataset.oldLeft = win.style.left;
        win.dataset.oldTop = win.style.top;
        win.dataset.oldWidth = win.style.width;
        win.dataset.oldHeight = win.style.height;
        win.style.left = '0';
        win.style.top = '0';
        win.style.width = '100%';
        win.style.height = 'calc(100% - 60px)';
        win.dataset.maximized = 'true';
    }
};

// Global app instance
window.app = {
    showApplications() {
        console.log('Show applications menu');
    },
    showSettings() {
        console.log('Show settings');
    },
    shutdown() {
        if (confirm('Shutdown GitVMD?')) {
            location.reload();
        }
    }
};

// Auto-init on page load
document.addEventListener('DOMContentLoaded', () => {
    const loader = new BootLoader();
    loader.init();
});
