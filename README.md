# Teensville Income Statement Generator

A web-based income statement generator for the Teensville business simulation.

## Quick Start

### Development

```bash
npm run dev
```

This will start the development server at `http://localhost:5173`

### Building

For **GitHub Pages** deployment:
```bash
npm run build
```

For **Cloudflare Pages/Workers** deployment:
```bash
npm run build:cloudflare
```

## Deployment

This application can be deployed to multiple platforms:

- **GitHub Pages**: See [GITHUB_PAGES.md](GITHUB_PAGES.md) for instructions
- **Cloudflare Pages/Workers**: See [webapp/DEPLOY.md](webapp/DEPLOY.md) for instructions

### Important: Base Path Configuration

The application uses different base paths depending on the deployment target:

- **GitHub Pages**: Uses `/IncomeStatement/` as the base path
- **Cloudflare Pages/Workers**: Uses `/` (root) as the base path

Make sure to build with the correct configuration for your deployment target:

- For GitHub Pages: `npm run build` (default)
- For Cloudflare: `npm run build:cloudflare` (sets `BUILD_TARGET=cloudflare`)

## Project Structure

```
IncomeStatement/
├── webapp/              # React application
│   ├── src/            # Source code
│   ├── public/         # Static assets
│   ├── dist/           # Build output (generated)
│   └── DEPLOY.md       # Cloudflare deployment guide
├── GITHUB_PAGES.md     # GitHub Pages deployment guide
└── package.json        # Root build scripts
```

## Troubleshooting

### Assets Return 404 Errors

If you see errors like:
```
GET /IncomeStatement/assets/index-xxx.css 404 (Not Found)
GET /IncomeStatement/assets/index-xxx.js 404 (Not Found)
```

This means the application was built with the wrong base path for your deployment target. 

**Solution**: Rebuild with the correct configuration and redeploy:
- For Cloudflare: `npm run build:cloudflare`
- For GitHub Pages: `npm run build`

**Note**: The npm scripts work cross-platform (Windows/Mac/Linux). If you need to run commands manually without npm scripts, Windows users should use PowerShell or Git Bash instead of CMD.

## License

See the repository license for details.
