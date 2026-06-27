#!/usr/bin/env node
/**
 * Copy proto files from src/proto to dist/proto
 * This script is run after TypeScript compilation to ensure proto files are available in dist
 */

const fs = require('fs');
const path = require('path');

// Ensure dist/proto directory exists
const distProtoDir = path.join(__dirname, '..', 'dist', 'proto');
fs.mkdirSync(distProtoDir, { recursive: true });

// Files to copy
const filesToCopy = ['index.js', 'index.cjs', 'index.d.ts', 'descriptors.ts'];

console.log('Copying proto files to dist/proto...');

for (const file of filesToCopy) {
    const srcPath = path.join(__dirname, '..', 'src', 'proto', file);
    
    // For .ts files, change extension to .js in destination
    let destFile = file;
    if (file.endsWith('.ts')) {
        destFile = file.replace(/\.ts$/, '.js');
    }
    
    const destPath = path.join(distProtoDir, destFile);
    
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`  ✓ Copied ${file} → ${destFile}`);
    } else {
        console.log(`  ⚠ Skipped ${file} (not found)`);
    }
}

console.log('Proto files copied successfully!');
