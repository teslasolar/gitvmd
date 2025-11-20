/**
 * GitVMD File Browser
 * Visual file manager with tree view and file operations
 */

export class FileBrowser {
    constructor(container, fileSystem) {
        this.container = container;
        this.fileSystem = fileSystem;
        this.currentPath = '/home/guest';
        this.selectedFile = null;
        this.clipboard = null;
        this.clipboardMode = null; // 'cut' or 'copy'

        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="file-browser">
                <div class="file-browser-toolbar">
                    <button class="toolbar-btn" onclick="fileBrowser.goUp()">⬆️ Up</button>
                    <button class="toolbar-btn" onclick="fileBrowser.goHome()">🏠 Home</button>
                    <button class="toolbar-btn" onclick="fileBrowser.refresh()">🔄 Refresh</button>
                    <div class="toolbar-spacer"></div>
                    <button class="toolbar-btn" onclick="fileBrowser.newFolder()">📁 New Folder</button>
                    <button class="toolbar-btn" onclick="fileBrowser.newFile()">📄 New File</button>
                </div>

                <div class="file-browser-path">
                    <span class="path-label">Location:</span>
                    <span class="path-value" id="current-path">${this.currentPath}</span>
                </div>

                <div class="file-browser-main">
                    <div class="file-browser-sidebar">
                        <div class="sidebar-title">Quick Access</div>
                        <div class="sidebar-item" onclick="fileBrowser.navigateTo('/home/guest')">
                            🏠 Home
                        </div>
                        <div class="sidebar-item" onclick="fileBrowser.navigateTo('/home/guest/projects')">
                            📂 Projects
                        </div>
                        <div class="sidebar-item" onclick="fileBrowser.navigateTo('/')">
                            💾 Root
                        </div>
                        <div class="sidebar-item" onclick="fileBrowser.navigateTo('/tmp')">
                            🗑️ Temp
                        </div>

                        <div class="sidebar-title" style="margin-top: 20px;">Storage</div>
                        <div class="storage-info">
                            <div class="storage-bar">
                                <div class="storage-used" style="width: 15%;"></div>
                            </div>
                            <div class="storage-text">15 MB / 100 MB</div>
                        </div>
                    </div>

                    <div class="file-browser-content">
                        <div class="file-list-header">
                            <div class="file-col-name">Name</div>
                            <div class="file-col-size">Size</div>
                            <div class="file-col-modified">Modified</div>
                        </div>
                        <div class="file-list" id="file-list">
                            <!-- Files will be rendered here -->
                        </div>
                    </div>

                    <div class="file-browser-properties" id="properties-panel" style="display: none;">
                        <div class="properties-title">Properties</div>
                        <div id="properties-content"></div>
                    </div>
                </div>

                <div class="file-browser-statusbar">
                    <span id="status-text">Ready</span>
                    <span id="file-count"></span>
                </div>
            </div>

            <!-- Context Menu -->
            <div class="context-menu" id="context-menu" style="display: none;">
                <div class="context-item" onclick="fileBrowser.openFile()">📂 Open</div>
                <div class="context-item" onclick="fileBrowser.renameFile()">✏️ Rename</div>
                <div class="context-divider"></div>
                <div class="context-item" onclick="fileBrowser.copyFile()">📋 Copy</div>
                <div class="context-item" onclick="fileBrowser.cutFile()">✂️ Cut</div>
                <div class="context-item" onclick="fileBrowser.pasteFile()">📄 Paste</div>
                <div class="context-divider"></div>
                <div class="context-item danger" onclick="fileBrowser.deleteFile()">🗑️ Delete</div>
                <div class="context-divider"></div>
                <div class="context-item" onclick="fileBrowser.showProperties()">ℹ️ Properties</div>
            </div>
        `;

        // Store global reference
        window.fileBrowser = this;

        this.setupEventListeners();
        this.loadDirectory(this.currentPath);
    }

    setupEventListeners() {
        // Hide context menu on click outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.context-menu')) {
                this.hideContextMenu();
            }
        });

        // Prevent default context menu
        this.container.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    loadDirectory(path) {
        const dir = this.resolvePath(path);

        if (!dir || dir.type !== 'dir') {
            this.showStatus('Error: Cannot access directory', 'error');
            return;
        }

        this.currentPath = path;
        this.updatePathDisplay();

        const fileList = this.container.querySelector('#file-list');
        fileList.innerHTML = '';

        const entries = Object.entries(dir.contents);

        if (entries.length === 0) {
            fileList.innerHTML = '<div class="empty-folder">📁 This folder is empty</div>';
            this.updateFileCount(0);
            return;
        }

        // Sort: directories first, then files
        entries.sort(([, a], [, b]) => {
            if (a.type === b.type) return 0;
            return a.type === 'dir' ? -1 : 1;
        });

        entries.forEach(([name, item]) => {
            const fileItem = this.createFileItem(name, item);
            fileList.appendChild(fileItem);
        });

        this.updateFileCount(entries.length);
    }

    createFileItem(name, item) {
        const div = document.createElement('div');
        div.className = 'file-item';
        div.dataset.name = name;
        div.dataset.type = item.type;

        const icon = item.type === 'dir' ? '📁' : this.getFileIcon(name);
        const size = item.type === 'file' ? this.formatSize(item.content?.length || 0) : '--';
        const modified = new Date().toLocaleDateString();

        div.innerHTML = `
            <div class="file-col-name">
                <span class="file-icon">${icon}</span>
                <span class="file-name">${name}</span>
            </div>
            <div class="file-col-size">${size}</div>
            <div class="file-col-modified">${modified}</div>
        `;

        // Double-click to open
        div.addEventListener('dblclick', () => {
            this.selectedFile = name;
            this.openFile();
        });

        // Single-click to select
        div.addEventListener('click', (e) => {
            this.selectFile(div, name);
        });

        // Right-click for context menu
        div.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.selectFile(div, name);
            this.showContextMenu(e.clientX, e.clientY);
        });

        return div;
    }

    selectFile(element, name) {
        // Remove previous selection
        this.container.querySelectorAll('.file-item').forEach(item => {
            item.classList.remove('selected');
        });

        // Select new file
        element.classList.add('selected');
        this.selectedFile = name;

        // Show properties
        this.updateProperties(name);
    }

    openFile() {
        if (!this.selectedFile) return;

        const item = this.getCurrentDirContents()[this.selectedFile];
        if (!item) return;

        if (item.type === 'dir') {
            const newPath = this.currentPath + (this.currentPath.endsWith('/') ? '' : '/') + this.selectedFile;
            this.loadDirectory(this.normalizePath(newPath));
        } else {
            this.showFileContent(this.selectedFile, item);
        }
    }

    showFileContent(name, file) {
        const modal = document.createElement('div');
        modal.className = 'file-viewer-modal';
        modal.innerHTML = `
            <div class="file-viewer">
                <div class="file-viewer-header">
                    <span>📄 ${name}</span>
                    <button class="close-btn" onclick="this.closest('.file-viewer-modal').remove()">✕</button>
                </div>
                <div class="file-viewer-content">
                    <pre>${this.escapeHtml(file.content || '(empty file)')}</pre>
                </div>
                <div class="file-viewer-footer">
                    <button onclick="this.closest('.file-viewer-modal').remove()">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    goUp() {
        if (this.currentPath === '/') return;

        const parts = this.currentPath.split('/').filter(p => p);
        parts.pop();
        const newPath = '/' + parts.join('/');
        this.loadDirectory(newPath || '/');
    }

    goHome() {
        this.loadDirectory('/home/guest');
    }

    refresh() {
        this.loadDirectory(this.currentPath);
        this.showStatus('Refreshed');
    }

    navigateTo(path) {
        this.loadDirectory(path);
    }

    newFolder() {
        const name = prompt('Enter folder name:');
        if (!name) return;

        const dir = this.getCurrentDirContents();
        if (dir[name]) {
            alert('A file or folder with that name already exists');
            return;
        }

        dir[name] = { type: 'dir', contents: {} };
        this.refresh();
        this.showStatus(`Created folder: ${name}`);
    }

    newFile() {
        const name = prompt('Enter file name:');
        if (!name) return;

        const dir = this.getCurrentDirContents();
        if (dir[name]) {
            alert('A file with that name already exists');
            return;
        }

        dir[name] = { type: 'file', content: '' };
        this.refresh();
        this.showStatus(`Created file: ${name}`);
    }

    renameFile() {
        if (!this.selectedFile) return;

        const newName = prompt('Enter new name:', this.selectedFile);
        if (!newName || newName === this.selectedFile) return;

        const dir = this.getCurrentDirContents();
        if (dir[newName]) {
            alert('A file with that name already exists');
            return;
        }

        dir[newName] = dir[this.selectedFile];
        delete dir[this.selectedFile];

        this.selectedFile = newName;
        this.refresh();
        this.showStatus(`Renamed to: ${newName}`);
    }

    copyFile() {
        if (!this.selectedFile) return;

        this.clipboard = this.selectedFile;
        this.clipboardMode = 'copy';
        this.showStatus(`Copied: ${this.selectedFile}`);
    }

    cutFile() {
        if (!this.selectedFile) return;

        this.clipboard = this.selectedFile;
        this.clipboardMode = 'cut';
        this.showStatus(`Cut: ${this.selectedFile}`);
    }

    pasteFile() {
        if (!this.clipboard) {
            alert('Clipboard is empty');
            return;
        }

        const sourceDir = this.getCurrentDirContents();
        const targetDir = this.getCurrentDirContents();

        if (targetDir[this.clipboard]) {
            alert('A file with that name already exists in this location');
            return;
        }

        if (this.clipboardMode === 'copy') {
            targetDir[this.clipboard] = JSON.parse(JSON.stringify(sourceDir[this.clipboard]));
        } else if (this.clipboardMode === 'cut') {
            targetDir[this.clipboard] = sourceDir[this.clipboard];
            delete sourceDir[this.clipboard];
            this.clipboard = null;
            this.clipboardMode = null;
        }

        this.refresh();
        this.showStatus('Pasted successfully');
    }

    deleteFile() {
        if (!this.selectedFile) return;

        if (!confirm(`Are you sure you want to delete "${this.selectedFile}"?`)) {
            return;
        }

        const dir = this.getCurrentDirContents();
        delete dir[this.selectedFile];

        this.selectedFile = null;
        this.refresh();
        this.hideProperties();
        this.showStatus('File deleted');
    }

    showProperties() {
        if (!this.selectedFile) return;
        this.updateProperties(this.selectedFile);
    }

    updateProperties(name) {
        const item = this.getCurrentDirContents()[name];
        if (!item) return;

        const panel = this.container.querySelector('#properties-panel');
        const content = this.container.querySelector('#properties-content');

        panel.style.display = 'block';

        const icon = item.type === 'dir' ? '📁' : this.getFileIcon(name);
        const size = item.type === 'file' ? this.formatSize(item.content?.length || 0) : '--';
        const itemCount = item.type === 'dir' ? Object.keys(item.contents).length : '--';

        content.innerHTML = `
            <div class="property-icon">${icon}</div>
            <div class="property-name">${name}</div>
            <div class="property-row">
                <span class="property-label">Type:</span>
                <span class="property-value">${item.type === 'dir' ? 'Folder' : 'File'}</span>
            </div>
            <div class="property-row">
                <span class="property-label">Size:</span>
                <span class="property-value">${size}</span>
            </div>
            ${item.type === 'dir' ? `
            <div class="property-row">
                <span class="property-label">Items:</span>
                <span class="property-value">${itemCount}</span>
            </div>
            ` : ''}
            <div class="property-row">
                <span class="property-label">Location:</span>
                <span class="property-value">${this.currentPath}</span>
            </div>
        `;
    }

    hideProperties() {
        const panel = this.container.querySelector('#properties-panel');
        panel.style.display = 'none';
    }

    showContextMenu(x, y) {
        const menu = this.container.querySelector('#context-menu');
        menu.style.display = 'block';
        menu.style.left = x + 'px';
        menu.style.top = y + 'px';
    }

    hideContextMenu() {
        const menu = document.getElementById('context-menu');
        if (menu) {
            menu.style.display = 'none';
        }
    }

    updatePathDisplay() {
        const pathEl = this.container.querySelector('#current-path');
        if (pathEl) {
            pathEl.textContent = this.currentPath;
        }
    }

    updateFileCount(count) {
        const countEl = this.container.querySelector('#file-count');
        if (countEl) {
            countEl.textContent = `${count} item${count !== 1 ? 's' : ''}`;
        }
    }

    showStatus(message, type = 'info') {
        const statusEl = this.container.querySelector('#status-text');
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.className = type;

            setTimeout(() => {
                statusEl.textContent = 'Ready';
                statusEl.className = '';
            }, 3000);
        }
    }

    getCurrentDirContents() {
        const dir = this.resolvePath(this.currentPath);
        return dir ? dir.contents : {};
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
            path = this.currentPath + '/' + path;
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

    getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const icons = {
            'txt': '📝',
            'md': '📘',
            'json': '📋',
            'js': '📜',
            'html': '🌐',
            'css': '🎨',
            'py': '🐍',
            'jpg': '🖼️',
            'png': '🖼️',
            'gif': '🖼️',
            'pdf': '📕',
            'zip': '📦',
            'mp3': '🎵',
            'mp4': '🎬'
        };
        return icons[ext] || '📄';
    }

    formatSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
