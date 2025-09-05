import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the dist directory
app.use(express.static(join(__dirname, 'dist')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Home route
app.get('/', (req, res) => {
  try {
    const template = fs.readFileSync(join(__dirname, 'dist/index.html'), 'utf8');
    const html = template.replace(
      '<!--ssr-outlet-->',
      '<div id="root"><div class="flex items-center justify-center min-h-screen"><div class="text-center"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-grub-red mx-auto mb-4"></div><p class="text-gray-600">Loading Grub-Gate...</p></div></div></div>'
    );
    res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
  } catch (error) {
    console.error('SSR Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Catch-all route for SPA
app.use((req, res) => {
  try {
    const template = fs.readFileSync(join(__dirname, 'dist/index.html'), 'utf8');
    const html = template.replace(
      '<!--ssr-outlet-->',
      '<div id="root"><div class="flex items-center justify-center min-h-screen"><div class="text-center"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-grub-red mx-auto mb-4"></div><p class="text-gray-600">Loading Grub-Gate...</p></div></div></div>'
    );
    res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
  } catch (error) {
    console.error('SSR Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 SSR Server running on http://localhost:${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Open your browser to http://localhost:${PORT}`);
});