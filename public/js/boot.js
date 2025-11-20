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
        // Try multiple paths for GitHub Pages compatibility
        const paths = [
            `/views/os/${osType}.json`,
            `../views/os/${osType}.json`,
            `../../views/os/${osType}.json`
        ];

        for (const path of paths) {
            try {
                const response = await fetch(path);
                if (response.ok) {
                    return await response.json();
                }
            } catch (e) {
                console.log(`Failed to load from ${path}`);
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
        const windowEl = this.createWindow(appName);
        const contentEl = windowEl.querySelector('.window-content');

        switch(appName) {
            case 'terminal':
                contentEl.innerHTML = '<div class="terminal" id="terminal"></div>';
                await this.initTerminal();
                break;
            case 'files':
                contentEl.innerHTML = '<div class="file-browser">File Browser</div>';
                break;
            case 'tagbrowser':
                contentEl.innerHTML = '<div class="tag-browser">Tag Browser</div>';
                break;
        }

        document.getElementById('workspace').appendChild(windowEl);
    }

    createWindow(title) {
        const win = document.createElement('div');
        win.className = 'os-window';
        win.style.left = '100px';
        win.style.top = '100px';
        win.style.width = '600px';
        win.style.height = '400px';

        win.innerHTML = `
            <div class="window-titlebar">
                <div class="window-title">${title}</div>
                <div class="window-controls">
                    <div class="window-control minimize"></div>
                    <div class="window-control maximize"></div>
                    <div class="window-control close" onclick="this.closest('.os-window').remove()"></div>
                </div>
            </div>
            <div class="window-content"></div>
        `;

        this.makeWindowDraggable(win);

        return win;
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

    async initTerminal() {
        const termEl = document.getElementById('terminal');
        if (!termEl) return;

        termEl.innerHTML = `
            <div class="terminal-line">
                <span class="terminal-prompt">guest@gitvmd:~$</span>
                <input type="text" class="terminal-input" placeholder="Type 'help' for commands">
            </div>
        `;

        const input = termEl.querySelector('.terminal-input');
        input.focus();

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const cmd = input.value;
                this.executeCommand(cmd, termEl);
                input.value = '';
            }
        });
    }

    executeCommand(cmd, termEl) {
        const output = document.createElement('div');
        output.className = 'terminal-line';

        switch(cmd.trim()) {
            case 'help':
                output.textContent = 'Available commands: help, clear, ls, pwd, uname, exit';
                break;
            case 'clear':
                termEl.innerHTML = '';
                return;
            case 'uname':
                output.textContent = 'GitVMD v1.0.0';
                break;
            default:
                output.textContent = `Command not found: ${cmd}`;
        }

        termEl.insertBefore(output, termEl.lastChild);
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
