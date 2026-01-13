# GitHub Pages Deployment Guide

This repository is configured to deploy the Teensville Income Statement Generator to GitHub Pages.

## Quick Start

The application is built to the `docs` folder and can be deployed directly to GitHub Pages.

### Enabling GitHub Pages

1. Go to your repository's **Settings**
2. Click **Pages** in the left sidebar
3. Under "Build and deployment":
   - **Source**: Deploy from a branch
   - **Branch**: Select `main` (or your default branch)
   - **Folder**: Select `/docs`
4. Click **Save**

Your site will be published at: `https://teensville.github.io/IncomeStatement/`

## Building for Deployment

The project is already configured with the correct base path for GitHub Pages.

### Build Command

```bash
npm run build
```

This will:
1. Install dependencies in the `webapp` folder
2. Build the React application with Vite
3. Output production-ready files to the `docs` folder
4. Configure assets with the correct `/IncomeStatement/` base path

### Development

To run the app locally during development:

```bash
npm run dev
```

This will start the development server at `http://localhost:5173`

## Configuration

The Vite configuration (`webapp/vite.config.js`) is set up with:
- **Base path**: `/IncomeStatement/` (for GitHub Pages project sites)
- **Output directory**: `../docs` (relative to webapp folder)

## Alternative Deployment Options

If you prefer other hosting platforms, see `webapp/DEPLOY.md` for Cloudflare Pages deployment instructions.
