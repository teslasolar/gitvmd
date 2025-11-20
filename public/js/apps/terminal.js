/**
 * GitVMD Terminal Emulator
 * Full-featured terminal with command execution
 */

export class Terminal {
    constructor(container) {
        this.container = container;
        this.history = [];
        this.historyIndex = 0;
        this.currentDir = '/home/guest';
        this.fileSystem = this.initFileSystem();
        this.commands = this.initCommands();
        this.output = [];

        this.render();
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
                                    'README.md': { type: 'file', content: 'Welcome to GitVMD!\n\nThis is a browser-based virtual desktop running on GitHub Pages.' },
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

    initCommands() {
        return {
            help: () => this.printHelp(),
            clear: () => this.clear(),
            ls: (args) => this.listFiles(args),
            pwd: () => this.currentDir,
            cd: (args) => this.changeDirectory(args),
            cat: (args) => this.readFile(args),
            echo: (args) => args.join(' '),
            date: () => new Date().toString(),
            uname: () => 'GitVMD v1.0.0 (Web)',
            whoami: () => 'guest',
            hostname: () => 'gitvmd',
            uptime: () => `up ${Math.floor(performance.now() / 1000)}s`,
            mkdir: (args) => this.makeDirectory(args),
            touch: (args) => this.createFile(args),
            rm: (args) => this.removeFile(args),
            tree: () => this.showTree(),
            neofetch: () => this.showSystemInfo(),
            exit: () => 'Use the window close button to exit',
            curl: (args) => this.curl(args),
            wget: (args) => `wget: ${args[0] || ''} - simulated download`,
            git: (args) => this.gitCommand(args),
            node: (args) => this.nodeCommand(args),
            python: (args) => this.pythonCommand(args),
            vim: () => 'vim is not available. Use the file browser instead.',
            nano: () => 'nano is not available. Use the file browser instead.'
        };
    }

    render() {
        this.container.innerHTML = `
            <div class="terminal-container">
                <div class="terminal-header">
                    <span>Terminal - ${this.currentDir}</span>
                </div>
                <div class="terminal-body" id="terminal-body">
                    <div class="terminal-welcome">
GitVMD Terminal v1.0.0
Type 'help' for available commands
                    </div>
                    <div id="terminal-output"></div>
                    <div class="terminal-input-line">
                        <span class="terminal-prompt">guest@gitvmd:~$</span>
                        <input type="text" class="terminal-input" id="terminal-input" autofocus autocomplete="off" spellcheck="false">
                    </div>
                </div>
            </div>
        `;

        this.inputEl = this.container.querySelector('#terminal-input');
        this.outputEl = this.container.querySelector('#terminal-output');

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.inputEl.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'Enter':
                    e.preventDefault();
                    this.executeCommand(this.inputEl.value);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.navigateHistory(-1);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.navigateHistory(1);
                    break;
                case 'Tab':
                    e.preventDefault();
                    this.autocomplete();
                    break;
            }
        });

        // Keep input focused
        this.container.addEventListener('click', () => {
            this.inputEl.focus();
        });
    }

    executeCommand(input) {
        const trimmed = input.trim();
        if (!trimmed) return;

        // Add to history
        this.history.push(trimmed);
        this.historyIndex = this.history.length;

        // Show command in output
        this.addOutput(`<span class="terminal-prompt">guest@gitvmd:${this.currentDir}$</span> ${trimmed}`);

        // Parse command
        const parts = trimmed.split(/\s+/);
        const command = parts[0];
        const args = parts.slice(1);

        // Execute
        if (this.commands[command]) {
            try {
                const result = this.commands[command](args);
                if (command !== 'clear') {
                    this.addOutput(result);
                }
            } catch (error) {
                this.addOutput(`Error: ${error.message}`, 'error');
            }
        } else {
            this.addOutput(`Command not found: ${command}. Type 'help' for available commands.`, 'error');
        }

        // Clear input
        this.inputEl.value = '';
        this.scrollToBottom();
    }

    addOutput(text, className = '') {
        const line = document.createElement('div');
        line.className = `terminal-line ${className}`;
        line.innerHTML = text;
        this.outputEl.appendChild(line);
    }

    clear() {
        this.outputEl.innerHTML = '';
        return '';
    }

    printHelp() {
        return `<div class="terminal-help">
Available Commands:
  <strong>System Info:</strong>
    help            Show this help message
    uname           Show system information
    whoami          Show current user
    hostname        Show hostname
    uptime          Show system uptime
    neofetch        Show system info banner

  <strong>File Operations:</strong>
    ls [path]       List directory contents
    pwd             Print working directory
    cd <path>       Change directory
    cat <file>      Display file contents
    mkdir <name>    Create directory
    touch <file>    Create empty file
    rm <file>       Remove file
    tree            Show directory tree

  <strong>Text & Output:</strong>
    echo <text>     Print text
    date            Show current date/time
    clear           Clear terminal

  <strong>Development:</strong>
    git <cmd>       Git commands (simulated)
    node <file>     Run Node.js (simulated)
    python <file>   Run Python (simulated)
    curl <url>      Fetch URL content
    wget <url>      Download file (simulated)

  <strong>Other:</strong>
    exit            Exit terminal
</div>`;
    }

    listFiles(args) {
        const path = args[0] || this.currentDir;
        const dir = this.resolvePath(path);

        if (!dir || dir.type !== 'dir') {
            return `ls: cannot access '${path}': No such file or directory`;
        }

        const items = Object.keys(dir.contents);
        if (items.length === 0) {
            return '(empty directory)';
        }

        return items.map(name => {
            const item = dir.contents[name];
            const prefix = item.type === 'dir' ? '📁 ' : '📄 ';
            const color = item.type === 'dir' ? 'color: #4a9eff;' : '';
            return `<span style="${color}">${prefix}${name}</span>`;
        }).join('  ');
    }

    changeDirectory(args) {
        if (!args[0]) {
            this.currentDir = '/home/guest';
            return '';
        }

        const path = args[0];
        const newPath = this.normalizePath(path);
        const dir = this.resolvePath(newPath);

        if (!dir) {
            return `cd: ${path}: No such file or directory`;
        }
        if (dir.type !== 'dir') {
            return `cd: ${path}: Not a directory`;
        }

        this.currentDir = newPath;
        this.updatePrompt();
        return '';
    }

    readFile(args) {
        if (!args[0]) {
            return 'cat: missing file operand';
        }

        const file = this.resolvePath(args[0]);
        if (!file) {
            return `cat: ${args[0]}: No such file or directory`;
        }
        if (file.type !== 'file') {
            return `cat: ${args[0]}: Is a directory`;
        }

        return file.content || '(empty file)';
    }

    makeDirectory(args) {
        if (!args[0]) {
            return 'mkdir: missing operand';
        }

        const name = args[0];
        const dir = this.resolvePath(this.currentDir);

        if (dir.contents[name]) {
            return `mkdir: cannot create directory '${name}': File exists`;
        }

        dir.contents[name] = { type: 'dir', contents: {} };
        return '';
    }

    createFile(args) {
        if (!args[0]) {
            return 'touch: missing operand';
        }

        const name = args[0];
        const dir = this.resolvePath(this.currentDir);

        if (dir.contents[name]) {
            return ''; // File exists, just update timestamp (simulated)
        }

        dir.contents[name] = { type: 'file', content: '' };
        return '';
    }

    removeFile(args) {
        if (!args[0]) {
            return 'rm: missing operand';
        }

        const name = args[0];
        const dir = this.resolvePath(this.currentDir);

        if (!dir.contents[name]) {
            return `rm: cannot remove '${name}': No such file or directory`;
        }

        delete dir.contents[name];
        return '';
    }

    showTree() {
        const buildTree = (node, prefix = '', isLast = true) => {
            if (node.type !== 'dir') return '';

            const items = Object.entries(node.contents);
            let output = '';

            items.forEach(([name, child], index) => {
                const isLastItem = index === items.length - 1;
                const connector = isLastItem ? '└── ' : '├── ';
                const icon = child.type === 'dir' ? '📁' : '📄';

                output += `${prefix}${connector}${icon} ${name}\n`;

                if (child.type === 'dir') {
                    const newPrefix = prefix + (isLastItem ? '    ' : '│   ');
                    output += buildTree(child, newPrefix, isLastItem);
                }
            });

            return output;
        };

        const root = this.resolvePath(this.currentDir);
        return `<pre>${this.currentDir}\n${buildTree(root)}</pre>`;
    }

    showSystemInfo() {
        const uptime = Math.floor(performance.now() / 1000);
        const memory = performance.memory ?
            `${(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(0)}MB / ${(performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(0)}MB` :
            'N/A';

        return `<pre style="color: #4a9eff;">
    ██████╗ ██╗████████╗██╗   ██╗███╗   ███╗██████╗
    ██╔════╝ ██║╚══██╔══╝██║   ██║████╗ ████║██╔══██╗
    ██║  ███╗██║   ██║   ██║   ██║██╔████╔██║██║  ██║
    ██║   ██║██║   ██║   ╚██╗ ██╔╝██║╚██╔╝██║██║  ██║
    ╚██████╔╝██║   ██║    ╚████╔╝ ██║ ╚═╝ ██║██████╔╝
     ╚═════╝ ╚═╝   ╚═╝     ╚═══╝  ╚═╝     ╚═╝╚═════╝
</pre>
<div style="line-height: 1.6;">
<strong>OS:</strong>        GitVMD v1.0.0 (Web)
<strong>Kernel:</strong>    Browser ${navigator.userAgent.match(/Chrome|Firefox|Safari|Edge/)?.[0] || 'Unknown'}
<strong>Uptime:</strong>    ${uptime}s
<strong>Memory:</strong>    ${memory}
<strong>Platform:</strong>  ${navigator.platform}
<strong>Resolution:</strong> ${screen.width}x${screen.height}
<strong>User:</strong>      guest@gitvmd
</div>`;
    }

    curl(args) {
        if (!args[0]) {
            return 'curl: try \'curl --help\' for more information';
        }
        return `Simulated fetch of ${args[0]}\n(Actual network requests not available in this terminal)`;
    }

    gitCommand(args) {
        const subcmd = args[0] || 'help';
        const responses = {
            'status': 'On branch main\nnothing to commit, working tree clean',
            'log': 'commit abc123 (HEAD -> main)\nAuthor: GitVMD User\nDate: ' + new Date().toDateString() + '\n\n    Initial commit',
            'branch': '* main',
            'help': 'Git commands are simulated in this environment'
        };
        return responses[subcmd] || `git ${subcmd}: command simulated`;
    }

    nodeCommand(args) {
        if (!args[0]) {
            return 'Node.js v20.0.0 (simulated)\nUse: node <file.js>';
        }
        return `Executing ${args[0]} with Node.js (simulated)...\nConsole output would appear here.`;
    }

    pythonCommand(args) {
        if (!args[0]) {
            return 'Python 3.11.0 (simulated)\nUse: python <file.py>';
        }
        return `Executing ${args[0]} with Python (simulated)...\nOutput would appear here.`;
    }

    resolvePath(path) {
        const normalized = this.normalizePath(path);
        const parts = normalized.split('/').filter(p => p);

        let current = this.fileSystem['/'];
        for (const part of parts) {
            if (!current.contents || !current.contents[part]) {
                return null;
            }
            current = current.contents[part];
        }

        return current;
    }

    normalizePath(path) {
        if (!path.startsWith('/')) {
            path = this.currentDir + '/' + path;
        }

        const parts = path.split('/').filter(p => p);
        const normalized = [];

        for (const part of parts) {
            if (part === '..') {
                normalized.pop();
            } else if (part !== '.') {
                normalized.push(part);
            }
        }

        return '/' + normalized.join('/');
    }

    updatePrompt() {
        const promptEl = this.container.querySelector('.terminal-prompt');
        if (promptEl) {
            const shortPath = this.currentDir.replace('/home/guest', '~');
            promptEl.textContent = `guest@gitvmd:${shortPath}$`;
        }
    }

    navigateHistory(direction) {
        this.historyIndex = Math.max(0, Math.min(this.history.length, this.historyIndex + direction));
        if (this.historyIndex < this.history.length) {
            this.inputEl.value = this.history[this.historyIndex];
        } else {
            this.inputEl.value = '';
        }
    }

    autocomplete() {
        const input = this.inputEl.value;
        const parts = input.split(' ');
        const lastPart = parts[parts.length - 1];

        if (parts.length === 1) {
            // Autocomplete command
            const matches = Object.keys(this.commands).filter(cmd => cmd.startsWith(lastPart));
            if (matches.length === 1) {
                this.inputEl.value = matches[0] + ' ';
            } else if (matches.length > 1) {
                this.addOutput(matches.join('  '));
            }
        }
    }

    scrollToBottom() {
        const body = this.container.querySelector('.terminal-body');
        if (body) {
            body.scrollTop = body.scrollHeight;
        }
    }
}
