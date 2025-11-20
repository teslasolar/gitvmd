/**
 * GitVMD Main Application
 * Core application logic and utilities
 */

import { ViewLoader } from '../../src/core/view-loader.js';
import { ComponentRegistry } from '../../src/core/component-registry.js';

class GitVMD {
    constructor() {
        this.viewLoader = new ViewLoader();
        this.componentRegistry = new ComponentRegistry();
        this.windows = new Map();
    }

    async init() {
        console.log('GitVMD initialized');
    }
}

// Create global instance
window.gitvmd = new GitVMD();

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.gitvmd.init();
    });
} else {
    window.gitvmd.init();
}

// Utility functions
window.showDocs = function() {
    window.open('https://github.com/yourusername/gitvmd/blob/main/README.md', '_blank');
};

window.showComponents = function() {
    window.open('https://github.com/yourusername/gitvmd/blob/main/docs/PERSPECTIVE_COMPONENTS.md', '_blank');
};

export { GitVMD };
