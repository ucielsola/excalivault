# Excalivault Docs

Documentation site for Excalivault Chrome extension, built with Astro and Tailwind CSS 4.

## Development

```bash
pnpm dev
```

## Build

```bash
pnpm build
```

## Deployment

This project is configured for Vercel. The `vercel.json` file contains the necessary configuration.

### Manual Deployment

1. Push to your git repository
2. Import project in Vercel
3. Set root directory to `docs`
4. Deploy!

## Project Structure

```
docs/
├── src/
│   ├── layouts/
│   │   └── Layout.astro          # Main layout
│   ├── pages/
│   │   ├── index.astro           # Home page
│   │   ├── installation.astro   # Installation guide
│   │   ├── how-it-works.astro    # Architecture overview
│   │   └── privacy.astro         # Privacy policy
│   ├── styles/
│   │   └── global.css            # Global styles + Tailwind
│   └── content/
│       └── docs/                 # Markdown content (future)
├── astro.config.mjs               # Astro configuration
├── vercel.json                   # Vercel configuration
└── package.json
```

## Tech Stack

- **Astro** - Static site generator
- **Tailwind CSS 4** - Utility-first CSS framework
- **TypeScript** - Type safety

## Customization

### Styling

The theme matches the main Excalivault extension:
- Dark theme by default
- oklch color space for modern color support
- Custom CSS variables defined in `src/styles/global.css`

### Adding New Pages

1. Create a new `.astro` file in `src/pages/`
2. Import and wrap in `<Layout>` component
3. Add navigation link to sidebar in existing pages

### Content

For more complex documentation, consider using Astro's content collections:
1. Define collection in `src/content.config.ts`
2. Create markdown files in `src/content/docs/`
3. Reference using Astro's content APIs
