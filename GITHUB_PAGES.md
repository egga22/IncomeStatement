# Deploying to GitHub Pages

This guide explains how to deploy the Teensville Income Statement Generator to GitHub Pages.

## Prerequisites

- Repository hosted on GitHub
- GitHub Actions enabled for the repository
- GitHub Pages enabled in repository settings

## Automatic Deployment

The repository includes a GitHub Actions workflow that automatically builds and deploys the application to GitHub Pages whenever changes are pushed to the `main` branch.

### Setup Steps

1. **Enable GitHub Pages** in your repository settings:
   - Go to **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**
   
2. **Push to main branch** or manually trigger the workflow:
   - Any push to `main` branch will trigger automatic deployment
   - Or go to **Actions** tab → **Deploy to GitHub Pages** → **Run workflow**

3. **Access your deployed site**:
   - Your site will be available at: `https://<username>.github.io/IncomeStatement/`
   - For example: `https://teensville.github.io/IncomeStatement/`

## Build Configuration

The GitHub Actions workflow (`/.github/workflows/deploy-github-pages.yml`) automatically:
- Installs Node.js and dependencies
- Builds the application from the `webapp` directory
- Deploys the built files to GitHub Pages

### Build Settings Summary

| Property | Value |
|----------|-------|
| **Build command** | `npm run build` |
| **Build directory** | `webapp` |
| **Build output** | `webapp/dist` |
| **Base path** | `/IncomeStatement/` (repository name for GitHub Pages) |
| **Node.js version** | 20 |

## Manual Deployment (Alternative)

If you need to deploy manually without GitHub Actions:

1. Install Wrangler or use the `gh-pages` npm package:
   ```bash
   npm install -g gh-pages
   ```

2. Build the application:
   ```bash
   cd webapp
   npm install
   npm run build
   ```

3. Deploy the dist folder:
   ```bash
   npx gh-pages -d webapp/dist
   ```

## Troubleshooting

### Build Fails

- Verify Node.js version is 20 or higher
- Check that `npm run build` works locally: `cd webapp && npm run build`
- Review the Actions logs in the **Actions** tab

### Page Not Loading or 404 Errors

- Ensure GitHub Pages is configured to use **GitHub Actions** as the source
- The workflow automatically sets the correct base path for GitHub Pages deployments
- Check that the workflow completed successfully in the **Actions** tab

### Assets Not Loading (MIME Type Errors)

- This should be fixed by the Vite configuration using the correct base path
- The built files in `webapp/dist` use absolute paths with the repository name
- Ensure you're deploying the built files from `dist`, not the source files

## Local Development

To run the app locally before deploying:

```bash
cd webapp
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

## Differences from Cloudflare Pages

- **GitHub Pages**: Uses base path `/IncomeStatement/` to match the repository name
- **Cloudflare Pages**: Can use root path (`/`) - configured separately via `BUILD_TARGET` environment variable
- Both deployments use the same build process but the base configuration automatically adjusts based on the environment
