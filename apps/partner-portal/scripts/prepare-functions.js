#!/usr/bin/env node

// Script to prepare Netlify functions by copying necessary files
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceHtml = path.join(__dirname, '../dist/client/index.html');
const targetHtml = path.join(__dirname, '../netlify/functions/index.html');
const sourceManifest = path.join(__dirname, '../dist/client/.vite/manifest.json');
const targetManifest = path.join(__dirname, '../netlify/functions/vite-manifest.json');

try {
  // Ensure the functions directory exists
  const functionsDir = path.dirname(targetHtml);
  if (!fs.existsSync(functionsDir)) {
    fs.mkdirSync(functionsDir, { recursive: true });
    console.log('📁 Created functions directory');
  }

  // Copy the built HTML template to the functions directory
  if (fs.existsSync(sourceHtml)) {
    fs.copyFileSync(sourceHtml, targetHtml);
    console.log('✅ Copied HTML template to functions directory');
    
    // Verify the copy was successful
    if (fs.existsSync(targetHtml)) {
      const stats = fs.statSync(targetHtml);
      console.log(`📄 HTML template size: ${stats.size} bytes`);
    }
  } else {
    console.warn('⚠️  Built HTML template not found at:', sourceHtml);
    console.warn('⚠️  Functions will use fallback HTML generation');
  }

  // Copy the Vite manifest to the functions directory
  if (fs.existsSync(sourceManifest)) {
    fs.copyFileSync(sourceManifest, targetManifest);
    console.log('✅ Copied Vite manifest to functions directory');
    
    // Verify the copy and show manifest info
    if (fs.existsSync(targetManifest)) {
      const manifest = JSON.parse(fs.readFileSync(targetManifest, 'utf8'));
      const entryCount = Object.keys(manifest).length;
      console.log(`📋 Manifest contains ${entryCount} entries`);
    }
  } else {
    console.warn('⚠️  Vite manifest not found at:', sourceManifest);
    console.warn('⚠️  Functions will extract assets from HTML template');
  }
  
  // Update SSR function with correct asset names from manifest
  const ssrFunctionPath = path.join(__dirname, '../netlify/functions/ssr.cjs');
  if (fs.existsSync(sourceManifest) && fs.existsSync(ssrFunctionPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(sourceManifest, 'utf8'));
      let ssrContent = fs.readFileSync(ssrFunctionPath, 'utf8');
      
      // Extract correct asset names from manifest
      const mainEntry = manifest['index.html'];
      if (mainEntry) {
        const correctCssFile = mainEntry.css && mainEntry.css[0] ? `/assets/${path.basename(mainEntry.css[0])}` : '/assets/index-DKLhbucu.css';
        const correctJsFile = mainEntry.file ? `/assets/${path.basename(mainEntry.file)}` : '/assets/index-DRdxD5vn.js';
        
        // Update hardcoded fallback asset names in SSR function
        ssrContent = ssrContent.replace(
          /cssFile = cssFile \|\| '\/assets\/[^']+';/g,
          `cssFile = cssFile || '${correctCssFile}';`
        );
        ssrContent = ssrContent.replace(
          /jsFile = jsFile \|\| '\/assets\/[^']+';/g,
          `jsFile = jsFile || '${correctJsFile}';`
        );
        
        fs.writeFileSync(ssrFunctionPath, ssrContent);
        console.log('✅ Updated SSR function with correct asset names:', { correctCssFile, correctJsFile });
      }
    } catch (err) {
      console.warn('⚠️ Could not update SSR function asset names:', err.message);
    }
  }
  
  console.log('🎉 Functions preparation completed successfully');
} catch (error) {
  console.error('❌ Error preparing functions:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}
