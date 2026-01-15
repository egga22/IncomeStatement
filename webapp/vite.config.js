import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use environment variable for base path, defaulting to GitHub Pages repository name
  // For Cloudflare Pages, set BUILD_TARGET=cloudflare
  base: process.env.BUILD_TARGET === 'cloudflare' ? '/' : '/IncomeStatement/',
})
