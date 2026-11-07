# Home Finder

A personal, frontend-only property shortlist built with Angular, TypeScript and Leaflet.

## Run locally

Requires Node.js 18.19.1+ (18.x), 20.11.1+ (20.x), or 22.x, and npm. Dependencies are locked in package-lock.json.

```sh
npm ci
npm start
```

Open http://127.0.0.1:4200. To create a production build:

```sh
npm run build
```

The production build writes the deployable application directly into `docs/`, including `docs/index.html`. It uses `/home-finder/` as its base path for GitHub Pages. Development uses `/` and does not overwrite `docs/`.

## Deploy to GitHub Pages

The deployment method is **build locally, commit the generated `docs/` directory, and push it to GitHub**. GitHub Pages publishes the committed files; no custom GitHub Actions workflow is required.

Configure the repository once:

1. Open **Settings → Pages** in `leonardo-ga/home-finder`.
2. Under **Build and deployment**, select **Deploy from a branch**.
3. Select branch **main** and folder **/docs**, then save.

For each release, run the checks and rebuild:

```sh
npm ci
npm test
npm run format:check
npm run build
```

Commit the source changes and the complete updated `docs/` directory, including removal of obsolete hashed bundles, then push to `main`:

```sh
git add -A
git commit -m "Update Home Finder"
git push origin main
```

Review the staged changes before committing. After GitHub Pages finishes publishing, the application will be available at **https://leonardo-ga.github.io/home-finder/**. This URL is the configured deployment target, not confirmation of an existing deployment.

`docs/` is generated deployment output and must stay committed. Do not edit its files manually or place project documentation there: the next production build replaces the directory. The `.nojekyll` file is copied from `public/` during the build. Project documentation lives in `documentation/`.

If the repository name or hosting path changes, update `production.baseHref` in `angular.json` and rebuild. For a custom domain served at the root, use `/`. See GitHub's [publishing-source instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Included

- Interactive OpenStreetMap map with price pins, selection and fit-to-homes.
- Add, edit and delete homes, with listing/photo links, coordinates, costs, area, rooms, bathrooms, floor, energy class, amenities, visit status and notes.
- Search, maximum rent, minimum area, status filtering, and price/area sorting.
- Compare up to four properties, including rent plus fees and cost per square metre.
- IndexedDB persistence on this browser/device; JSON backup export and validated replacement import.
- Two saved commute destinations and Google Maps route links for transit, driving, cycling or walking.
- Responsive layouts and clearly marked fictional Milan examples that can be removed.

## Current scope

Prices currently represent **monthly rental costs** in euros. Purchase prices and ownership costs are not modeled yet. Property positions are entered manually using latitude/longitude; no geocoding account is required.

Automatic Monday-morning travel durations are **not implemented**. Route links open Google Maps, where you can set a departure/arrival date and time. A future routing integration needs a provider, billing/key configuration where required, and possibly a small serverless proxy. Never put a secret API key in frontend source.

There is no backend, login, scraping, or cross-device sync. Browser data can be cleared or evicted: export backups regularly. Import replaces the current shortlist after confirmation. Your home records are not included in the built site or stored in Git.

Map tiles require internet access and use the OpenStreetMap public tile service, with attribution. Review its usage policy before larger/public deployment: https://operations.osmfoundation.org/policies/tiles/. Fonts load from Google Fonts with system fallbacks. Optional photo URLs load from their source websites, and route links share the selected origin and destination with Google Maps when opened.

## Source

- `src/app/app.component.ts`: application shell.
- `src/app/features/homes/domain/`: models, runtime validation and pure business rules.
- `src/app/features/homes/data-access/`: signal-based feature store.
- `src/app/features/homes/pages/`: page composition and UI workflows.
- `src/app/features/homes/components/`: independent cards, map, details, comparison and editors.
- `src/app/core/storage/`: IndexedDB and file-download adapters.
- `src/app/shared/`: reusable formatting and modal focus behavior.

See [Architecture](documentation/architecture.md) for dependency rules, persistence guarantees, compatibility, and extension guidance.

Angular 19 was selected for compatibility with the installed Node 18 environment. Upgrade Node and Angular together before a long-lived public deployment.

Run regression tests with `npm test`, check formatting with `npm run format:check`, and apply formatting with `npm run format`. TypeScript strict mode, unused declaration checks, return checks, and Angular strict template checks are enabled. Browser interaction/visual verification could not be completed because browser automation was unavailable in this session.
