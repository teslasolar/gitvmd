#!/usr/bin/env node
/**
 * Local GitVMD Test Server
 * Simulates GitHub Pages environment for local testing
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8080;
const BASE_PATH = '/gitvmd'; // Simulate GitHub Pages subdirectory

// MIME types mapping
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'font/otf'
};

function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return MIME_TYPES[ext] || 'application/octet-stream';
}

function serveFile(res, filePath) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 Not Found</h1>');
            return;
        }

        const mimeType = getMimeType(filePath);
        res.writeHead(200, {
            'Content-Type': mimeType,
            'Access-Control-Allow-Origin': '*'
        });
        res.end(data);
    });
}

const server = http.createServer((req, res) => {
    let parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname;

    // Log request
    console.log(`${new Date().toISOString()} - ${req.method} ${pathname}`);

    // Remove base path if present (simulate GitHub Pages subdirectory)
    if (pathname.startsWith(BASE_PATH)) {
        pathname = pathname.substring(BASE_PATH.length);
    }

    // Default to index.html for directory requests
    if (pathname === '/' || pathname === '') {
        pathname = '/index.html';
    }

    // Handle /public/ prefix
    let filePath;
    if (pathname.startsWith('/public/')) {
        filePath = path.join(__dirname, pathname);
    } else {
        filePath = path.join(__dirname, pathname);
    }

    // Security check - prevent directory traversal
    const resolvedPath = path.resolve(filePath);
    const rootPath = path.resolve(__dirname);
    if (!resolvedPath.startsWith(rootPath)) {
        res.writeHead(403, { 'Content-Type': 'text/html' });
        res.end('<h1>403 Forbidden</h1>');
        return;
    }

    // Check if file exists
    fs.stat(filePath, (err, stats) => {
        if (err) {
            // Try with .html extension
            const htmlPath = filePath + '.html';
            fs.stat(htmlPath, (err2, stats2) => {
                if (err2) {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(`<h1>404 Not Found</h1><p>Path: ${pathname}</p>`);
                } else if (stats2.isFile()) {
                    serveFile(res, htmlPath);
                } else {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end('<h1>404 Not Found</h1>');
                }
            });
            return;
        }

        if (stats.isDirectory()) {
            // Try index.html in directory
            const indexPath = path.join(filePath, 'index.html');
            fs.stat(indexPath, (err, indexStats) => {
                if (err || !indexStats.isFile()) {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end('<h1>404 Not Found</h1><p>No index.html in directory</p>');
                } else {
                    serveFile(res, indexPath);
                }
            });
        } else {
            serveFile(res, filePath);
        }
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(60));
    console.log('🚀 GitVMD Local Test Server');
    console.log('='.repeat(60));
    console.log(`Server running at:`);
    console.log(`  Local:   http://localhost:${PORT}/`);
    console.log(`  Network: http://0.0.0.0:${PORT}/`);
    console.log('');
    console.log('Quick Links:');
    console.log(`  Landing:     http://localhost:${PORT}/`);
    console.log(`  OS Selector: http://localhost:${PORT}/public/index.html`);
    console.log(`  Test Suite:  http://localhost:${PORT}/public/test.html`);
    console.log('');
    console.log('Test with GitHub Pages path:');
    console.log(`  http://localhost:${PORT}${BASE_PATH}/`);
    console.log(`  http://localhost:${PORT}${BASE_PATH}/public/index.html`);
    console.log('');
    console.log('Press Ctrl+C to stop');
    console.log('='.repeat(60));
});

// Handle shutdown gracefully
process.on('SIGTERM', () => {
    console.log('\n👋 Shutting down server...');
    server.close(() => {
        console.log('✅ Server stopped');
        process.exit(0);
    });
});
