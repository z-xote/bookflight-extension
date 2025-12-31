import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..'); // Absolute project root

console.log('🚀 Building Chrome Extension...\n');

// Read package.json to get version and name
const packageJson = JSON.parse(
  fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8')
);

// ============================================================================
// STEP 1: Create Next.js Image Shim (Before Build)
// ============================================================================
const shimDir = path.join(rootDir, 'src', 'lib');
if (!fs.existsSync(shimDir)) {
  fs.mkdirSync(shimDir, { recursive: true });
}

const imageShim = `// Shim for Next.js Image component in extension
import React from 'react';

export default function Image({ src, alt, width, height, className, ...props }) {
  return React.createElement('img', {
    src,
    alt,
    width,
    height,
    className,
    ...props
  });
}`;

const shimPath = path.join(shimDir, 'image-shim.js');
fs.writeFileSync(shimPath, imageShim);
console.log('✓ Image shim created');

// ============================================================================
// STEP 2: Create Extension Entry Point
// ============================================================================
const entryPoint = `import React from 'react';
import { createRoot } from 'react-dom/client';
import Home from './app/page';

const root = document.getElementById('root');

if (root) {
  createRoot(root).render(
    React.createElement(React.StrictMode, null,
      React.createElement(Home)
    )
  );
} else {
  console.error('Root element not found');
}`;

const entryPath = path.join(rootDir, 'src', 'entry.tsx');
fs.writeFileSync(entryPath, entryPoint);
console.log('✓ Extension entry point created');

// ============================================================================
// STEP 3: Prepare Dist Folder
// ============================================================================
const distDir = path.join(rootDir, 'dist');
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true });
}
fs.mkdirSync(distDir);

// ============================================================================
// STEP 4: Build JavaScript Bundle with esbuild
// ============================================================================
console.log('⚙️  Bundling JavaScript...');

await esbuild.build({
  entryPoints: [entryPath],
  bundle: true,
  outfile: path.join(distDir, 'extension.js'),
  format: 'iife', // ✅ Keep IIFE for browser
  platform: 'browser',
  target: ['chrome100'],
  loader: {
    '.tsx': 'tsx',
    '.ts': 'ts',
    '.jsx': 'jsx',
    '.js': 'js',
  },
  define: {
    'process.env.NODE_ENV': '"production"',
    'global': 'globalThis', // ✅ FIX: Map global to globalThis for chrome API
  },
  inject: [], // ✅ No shims needed
  external: [], // ✅ Bundle everything, don't externalize
  minify: false,
  sourcemap: true,
  jsx: 'automatic',
  jsxImportSource: 'react',
  alias: {
    'next/image': shimPath,
    '@pkg': path.join(rootDir, 'package.json'), // ✅ FIX: Add package.json alias
  },
  // ✅ CRITICAL: Ensure React is bundled properly
  conditions: ['browser', 'import', 'module'],
  mainFields: ['browser', 'module', 'main'],
}).then(() => {
  console.log('✓ JavaScript bundle created');
}).catch((err) => {
  console.error('❌ esbuild failed:');
  console.error(err);
  process.exit(1);
});

// ============================================================================
// STEP 4.5: Build Content Script
// ============================================================================
console.log('⚙️  Bundling content script...');

await esbuild.build({
  entryPoints: [path.join(rootDir, 'src', 'content.ts')],
  bundle: true,
  outfile: path.join(distDir, 'content.js'),
  format: 'iife',
  platform: 'browser',
  target: ['chrome100'],
  minify: false,
  sourcemap: true,
}).then(() => {
  console.log('✓ Content script bundle created');
}).catch((err) => {
  console.error('❌ Content script build failed:');
  console.error(err);
  process.exit(1);
});

// Copy content.css
const contentCSS = path.join(rootDir, 'src', 'content.css');
if (fs.existsSync(contentCSS)) {
  fs.copyFileSync(contentCSS, path.join(distDir, 'content.css'));
  console.log('✓ Content CSS copied');
}

// ============================================================================
// STEP 5: Compile Tailwind CSS
// ============================================================================
console.log('⚙️  Compiling Tailwind CSS...');

const inputCSS = path.join(rootDir, 'src', 'app', 'globals.css');
const outputCSS = path.join(distDir, 'styles.css');

const isWindows = process.platform === 'win32';
const npxCommand = isWindows ? 'npx.cmd' : 'npx';

try {
  execSync(
    `${npxCommand} tailwindcss -i "${inputCSS}" -o "${outputCSS}" --minify`,
    { 
      stdio: 'inherit',
      cwd: rootDir
    }
  );
  console.log('✓ CSS compiled with Tailwind');
} catch (err) {
  console.error('❌ Tailwind CSS compilation failed');
  throw err;
}

// ============================================================================
// STEP 6: Copy Public Assets
// ============================================================================
const publicDir = path.join(rootDir, 'public');
if (fs.existsSync(publicDir)) {
  const publicFiles = fs.readdirSync(publicDir);
  publicFiles.forEach((file) => {
    const srcPath = path.join(publicDir, file);
    const destPath = path.join(distDir, file);
    fs.copyFileSync(srcPath, destPath);
  });
  console.log('✓ Assets copied');
}

// ============================================================================
// STEP 7: Create Extension HTML
// ============================================================================
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bookflight Guide</title>
  <link rel="stylesheet" href="styles.css">
  <style>
    body {
      margin: 0;
      padding: 0;
      width: 420px;
      height: 600px;
      overflow: hidden;
    }
    #root {
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script src="extension.js"></script>
</body>
</html>`;

fs.writeFileSync(path.join(distDir, 'extension.html'), html);
console.log('✓ extension.html created');

// ============================================================================
// STEP 8: Generate Manifest
// ============================================================================
const manifest = {
  "manifest_version": 3,
  "name": "Bookflight Guide",
  "version": packageJson.version,
  "description": "Amadeus Booking Assistant - Your guide to efficient flight bookings",
  "action": {
    "default_popup": "extension.html",
    "default_icon": {
      "16": "icon.png",
      "32": "icon.png",
      "48": "icon.png",
      "128": "icon.png"
    }
  },
  "icons": {
    "16": "icon.png",
    "32": "icon.png",
    "48": "icon.png",
    "128": "icon.png"
  },
  "permissions": [
    "storage"
  ],
  "host_permissions": [
    "https://api.anthropic.com/*"
  ],
  // ✨ NEW: Content script injection
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "css": ["content.css"],
      "run_at": "document_idle"
    }
  ],
  // ✨ NEW: Make extension.html accessible from iframe
  "web_accessible_resources": [
    {
      "resources": ["extension.html", "styles.css", "extension.js", "*.png"],
      "matches": ["<all_urls>"]
    }
  ]
};

fs.writeFileSync(
  path.join(distDir, 'manifest.json'), 
  JSON.stringify(manifest, null, 2)
);
console.log(`✓ manifest.json created (v${packageJson.version})`);

// ============================================================================
// STEP 8.5: Create Version File
// ============================================================================
fs.writeFileSync(
  path.join(distDir, 'version.txt'),
  `v${packageJson.version}`
);
console.log(`✓ version.txt created (v${packageJson.version})`);

// ============================================================================
// STEP 9: Verify Critical Files Exist
// ============================================================================
const criticalFiles = [
  'extension.html',
  'extension.js',
  'content.js',  
  'content.css',    
  'styles.css',
  'manifest.json',
  'icon.png',
  'version.txt'
];

const missingFiles = criticalFiles.filter(
  file => !fs.existsSync(path.join(distDir, file))
);

if (missingFiles.length > 0) {
  console.error('\n❌ Build incomplete! Missing files:');
  missingFiles.forEach(file => console.error(`   - ${file}`));
  process.exit(1);
}

// ============================================================================
// SUCCESS
// ============================================================================
console.log('\n✅ Extension built successfully!\n');
console.log('📦 Output files in dist/:');
criticalFiles.forEach(file => {
  const size = fs.statSync(path.join(distDir, file)).size;
  const sizeKB = (size / 1024).toFixed(2);
  console.log(`   - ${file} (${sizeKB} KB)`);
});

console.log('\n🔧 To load in Chrome:');
console.log('   1. Open chrome://extensions/');
console.log('   2. Enable "Developer mode"');
console.log('   3. Click "Load unpacked"');
console.log('   4. Select the "dist" folder\n');

console.log(`📍 Dist folder: ${distDir}\n`);