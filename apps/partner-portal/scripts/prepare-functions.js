#!/usr/bin/env node

// Script to prepare Netlify functions by copying necessary files
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceHtml = path.join(__dirname, '../dist/client/index.html');
const targetHtml = path.join(__dirname, '../netlify/functions/index.html');
const sourceManifest = path.join(__dirname, '../dist/client/manifest.json');
const targetManifest = path.join(__dirname, '../netlify/functions/manifest.json');

try {
  // Ensure the functions directory exists
  const functionsDir = path.dirname(targetHtml);
  if (!fs.existsSync(functionsDir)) {
    fs.mkdirSync(functionsDir, { recursive: true });
  }

  // Copy the built HTML template to the functions directory
  if (fs.existsSync(sourceHtml)) {
    fs.copyFileSync(sourceHtml, targetHtml);
    console.log('✅ Copied HTML template to functions directory');
  } else {
    console.warn('⚠️  Built HTML template not found, functions will use fallback');
  }

  // Copy the Vite manifest to the functions directory
  if (fs.existsSync(sourceManifest)) {
    fs.copyFileSync(sourceManifest, targetManifest);
    console.log('✅ Copied Vite manifest to functions directory');
  } else {
    console.warn('⚠️  Vite manifest not found, functions will use fallback asset names');
  }
} catch (error) {
  console.error('❌ Error preparing functions:', error.message);
  process.exit(1);
}
