import { defineConfig } from 'vite';

export default defineConfig({
  root: 'app', // Set the root to the subfolder containing index.html
  build: {
    outDir: '../dist', // Ensure build output goes to the parent directory
    emptyOutDir: true, // Optional: Clean the output directory before each build
  },
  base: '/Hackathon-2024', // For GitHub Pages
});
