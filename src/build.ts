import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 Building Chrome Extension...\n');

// Read package.json to get version and name
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

// Create Next.js image shim FIRST (before build)
const shimDir = 'src/lib';
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

fs.writeFileSync('src/lib/image-shim.js', imageShim);
console.log('✓ Image shim created');

// Create extension entry point
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

fs.writeFileSync('src/entry.tsx', entryPoint);
console.log('✓ Extension entry point created');

// Clean dist folder
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true });
}
fs.mkdirSync('dist');

// Build JavaScript bundle
esbuild.build({
  entryPoints: ['src/entry.tsx'],
  bundle: true,
  outfile: 'dist/extension.js',
  format: 'iife',
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
  },
  minify: false,
  sourcemap: true,
  jsx: 'automatic',
  jsxImportSource: 'react',
  alias: {
    'next/image': './src/lib/image-shim.js'
  }
}).then(() => {
  console.log('✓ JavaScript bundle created');
  
  // Compile Tailwind CSS
  console.log('⚙️  Compiling Tailwind CSS...');
  try {
    execSync(
      'npx tailwindcss -i ./src/app/globals.css -o ./dist/styles.css --minify',
      { stdio: 'inherit' }
    );
    console.log('✓ CSS compiled with Tailwind');
  } catch (err) {
    console.error('❌ Tailwind CSS compilation failed');
    throw err;
  }
  
  // Copy assets from public folder
  if (fs.existsSync('public')) {
    const publicFiles = fs.readdirSync('public');
    publicFiles.forEach((file) => {
      fs.copyFileSync(
        path.join('public', file),
        path.join('dist', file)
      );
    });
    console.log('✓ Assets copied');
  }
  
  // Create extension.html
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
  
  fs.writeFileSync('dist/extension.html', html);
  console.log('✓ extension.html created');
  
  // Generate manifest.json from package.json
  const manifest = {
    "manifest_version": 3,
    "name": "Bookflight Guide",
    "version": packageJson.version, // ✨ Derived from package.json
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
    ]
  };
  
  fs.writeFileSync('dist/manifest.json', JSON.stringify(manifest, null, 2));
  console.log(`✓ manifest.json created (v${packageJson.version})`);
  
  console.log('\n✅ Extension built successfully!\n');
  console.log('📦 Output files in dist/:');
  console.log('   - extension.html');
  console.log('   - extension.js');
  console.log('   - extension.js.map');
  console.log('   - styles.css');
  console.log('   - manifest.json');
  console.log('   - icon.png\n');
  console.log('🔧 To load in Chrome:');
  console.log('   1. Open chrome://extensions/');
  console.log('   2. Enable "Developer mode"');
  console.log('   3. Click "Load unpacked"');
  console.log('   4. Select the "dist" folder\n');
  
}).catch((err) => {
  console.error('❌ Build failed:');
  console.error(err);
  process.exit(1);
});