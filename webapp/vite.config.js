import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use environment variable for base path
  // VITE_BASE_PATH: Override the base path (e.g., '/' for root deployment)
  // BUILD_TARGET=cloudflare: Use '/' for Cloudflare Pages
  // Default: '/IncomeStatement/' for standard GitHub Pages (username.github.io/IncomeStatement/)
  // Note: GitHub Actions workflow sets VITE_BASE_PATH='/' automatically
  base: process.env.VITE_BASE_PATH || (process.env.BUILD_TARGET === 'cloudflare' ? '/' : '/IncomeStatement/'),
})
