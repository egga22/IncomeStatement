# Deploying to Cloudflare Pages/Workers

This guide explains how to deploy the Teensville Income Statement Generator to Cloudflare Pages or Workers.

## Prerequisites

- A [Cloudflare account](https://dash.cloudflare.com/sign-up)
- This repository connected to your GitHub account

## Deployment Steps

### Option 1: Connect via Cloudflare Dashboard (Recommended)

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** in the left sidebar
3. Click **Create application** → **Pages** → **Connect to Git**
4. Select your GitHub account and choose this repository
5. Configure the build settings:

| Setting | Value |
|---------|-------|
| **Project name** | `income-statement` (or your preferred name) |
| **Production branch** | `main` |
| **Framework preset** | `None` (or `Vite` if available) |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | (leave empty/default) |

6. Click **Save and Deploy**

### Option 2: Using Wrangler CLI

1. Install Wrangler:
   ```bash
   npm install -g wrangler
   ```

2. Login to Cloudflare:
   ```bash
   wrangler login
   ```

3. Build with the correct base path (from repository root):
   ```bash
   npm run build:cloudflare
   ```

4. Deploy using wrangler.jsonc configuration from the root directory:
   ```bash
   wrangler pages deploy
   ```
   
   Or specify the project name:
   ```bash
   wrangler pages deploy dist --project-name=income-statement
   ```

## Build Configuration Summary

| Property | Value |
|----------|-------|
| **Build command** | `npm run build:cloudflare` |
| **Build output directory** | `dist` |
| **Root directory** | (leave empty/default) |
| **Node.js version** | 18+ (recommended) |

## Environment Variables

For Cloudflare Pages/Workers deployment, set the following environment variable:

| Variable | Value |
|----------|-------|
| **BUILD_TARGET** | `cloudflare` |

This ensures the app uses the correct base path (`/` for Cloudflare instead of `/IncomeStatement/` for GitHub Pages).

### Setting in Cloudflare Dashboard

To set this in Cloudflare Dashboard for automatic builds:
1. Go to your Pages project
2. Navigate to **Settings** → **Environment variables**
3. Add `BUILD_TARGET` with value `cloudflare`
4. Redeploy your project

### Manual Build

When building locally with Wrangler CLI, use the build script from the repository root:
```bash
npm run build:cloudflare
```


This ensures assets are referenced from the root path (`/assets/...`) instead of `/IncomeStatement/assets/...`.

## Custom Domain (Optional)

After deployment, you can add a custom domain:

1. Go to your Pages project in the Cloudflare Dashboard
2. Navigate to **Custom domains**
3. Click **Set up a custom domain**
4. Follow the prompts to add your domain

## Troubleshooting

### Build Fails

- Verify Node.js version is 18 or higher
- Check that `npm run build:cloudflare` works locally from the repository root
- Ensure **Build output directory** is set to `dist`
- Verify the `BUILD_TARGET` environment variable is set to `cloudflare` in Cloudflare Dashboard

### Page Not Loading or 404 Errors for Assets

- Confirm **Build output directory** is set to `dist`
- **CRITICAL**: Verify the build was done with `BUILD_TARGET=cloudflare` environment variable set
- The built `index.html` should reference assets with `/assets/...` (root path), not `/IncomeStatement/assets/...`
- Check the deployment logs for any errors
- If assets return 404, rebuild with the correct environment variable and redeploy

## Local Development

To run the app locally before deploying:

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`
