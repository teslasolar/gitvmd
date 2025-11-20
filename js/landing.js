/**
 * GitVMD Landing Page JavaScript
 */

// Analytics tracking (optional)
function trackClick(category, action, label) {
    console.log(`Track: ${category} - ${action} - ${label}`);
    // Add your analytics code here (Google Analytics, Plausible, etc.)
}

// Add click tracking to all buttons
document.addEventListener('DOMContentLoaded', () => {
    // Track CTA button clicks
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            trackClick('CTA', 'click', btn.textContent);
        });
    });

    // Track OS link clicks
    document.querySelectorAll('.os-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const osName = link.querySelector('.os-name').textContent;
            trackClick('Quick Access', 'boot', osName);
        });
    });

    // Track documentation link clicks
    document.querySelectorAll('.doc-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            trackClick('Documentation', 'view', link.textContent);
        });
    });

    // Show browser compatibility warning if needed
    checkBrowserCompatibility();

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Press 'S' to launch SCADA
        if (e.key === 's' || e.key === 'S') {
            if (!e.target.matches('input, textarea')) {
                window.location.href = 'public/index.html?os=scada';
            }
        }
        // Press 'D' to launch Developer
        if (e.key === 'd' || e.key === 'D') {
            if (!e.target.matches('input, textarea')) {
                window.location.href = 'public/index.html?os=dev-env';
            }
        }
    });

    console.log('GitVMD Landing Page v1.0.0');
    console.log('Press S for SCADA | Press D for Developer');
});

function checkBrowserCompatibility() {
    const features = {
        webassembly: typeof WebAssembly !== 'undefined',
        indexedDB: 'indexedDB' in window,
        serviceWorker: 'serviceWorker' in navigator,
        webWorker: typeof Worker !== 'undefined'
    };

    const isCompatible = Object.values(features).every(f => f === true);

    if (!isCompatible) {
        console.warn('Browser compatibility issues detected:', features);

        // Show warning banner (optional)
        const warning = document.createElement('div');
        warning.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #ff9800;
            color: white;
            padding: 10px;
            text-align: center;
            z-index: 9999;
        `;
        warning.textContent = 'Your browser may not support all features. Please use Chrome, Firefox, or Edge for the best experience.';
        document.body.prepend(warning);
    }
}

// Preload critical resources
function preloadResources() {
    const resources = [
        'public/js/boot.js',
        'public/styles/os.css'
    ];

    resources.forEach(url => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
    });
}

// Call preload after page load
window.addEventListener('load', preloadResources);
