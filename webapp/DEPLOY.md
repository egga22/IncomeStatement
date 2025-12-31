# Deploying to Cloudflare Pages

This guide explains how to deploy the Teensville Income Statement Generator to Cloudflare Pages.

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
| **Project name** | `teensville-income-statement` (or your preferred name) |
| **Production branch** | `main` |
| **Framework preset** | `None` (or `Vite` if available) |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | `webapp` |

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

3. Navigate to the webapp directory and build:
   ```bash
   cd webapp
   npm install
   npm run build
   ```

4. Deploy:
   ```bash
   wrangler pages deploy dist --project-name=teensville-income-statement
   ```

## Build Configuration Summary

| Property | Value |
|----------|-------|
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | `webapp` |
| **Node.js version** | 18+ (recommended) |

## Environment Variables

No environment variables are required for this application.

## Custom Domain (Optional)

After deployment, you can add a custom domain:

1. Go to your Pages project in the Cloudflare Dashboard
2. Navigate to **Custom domains**
3. Click **Set up a custom domain**
4. Follow the prompts to add your domain

## Troubleshooting

### Build Fails

- Ensure the **Root directory** is set to `webapp`
- Verify Node.js version is 18 or higher
- Check that `npm run build` works locally

### Page Not Loading

- Confirm **Build output directory** is set to `dist`
- Check the deployment logs for any errors

## Local Development

To run the app locally before deploying:

```bash
cd webapp
npm install
npm run dev
```

The app will be available at `http://localhost:5173`
