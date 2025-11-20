/**
 * GitVMD OS Selector Index JavaScript
 * Handles global boot functions and utilities
 */

// Global boot function for inline onclick handlers
window.bootOS = async function(osType) {
    const { BootLoader } = await import('./boot.js');
    const loader = new BootLoader();
    await loader.bootOS(osType);
};

// Global utility functions
window.showDocs = function() {
    window.open('https://github.com/teslasolar/gitvmd/blob/main/README.md', '_blank');
};

window.showComponents = function() {
    window.open('https://github.com/teslasolar/gitvmd/blob/main/docs/PERSPECTIVE_COMPONENTS.md', '_blank');
};

// Log version info
console.log('GitVMD OS Selector v1.0.0');
console.log('Repository: https://github.com/teslasolar/gitvmd');
