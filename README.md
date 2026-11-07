# Home Finder

A read-only home catalogue and map built with Angular, TypeScript and Leaflet.

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

## Catalogue

The sole data source is [home.catalogue.ts](src/app/features/homes/domain/home.catalogue.ts). The application displays the seven selected Immobiliare.it listings, their descriptions and photos, and their positions on an interactive map. Selecting a card or pin opens the property details and original listing link.

The website has no add, edit, delete, import, or export controls. It does not read or write IndexedDB, local storage, or session storage. Any data saved by previous versions is ignored. Selection is temporary and resets on refresh.

To add, remove, or update a home, edit the catalogue file, run the checks, and build and deploy a new version. Every browser displays the catalogue from that deployed version. Catalogue records are read-only in TypeScript and frozen at runtime.

Listing details, photos, and published map positions were verified on **7 November 2026**. See [Catalogue sources](documentation/listings.md). Listings are a static snapshot and do not update automatically. Prices represent monthly rental costs in euros. Automatic commute estimates are not implemented.

## Development

- Run tests: `npm test`.
- Check Angular templates without generating a build: `npm exec -- ngc --project tsconfig.json --noEmit`.
- Check formatting: `npm run format:check`.
- Apply formatting: `npm run format`.

TypeScript strict checks and Angular strict template checks are enabled. See [Architecture](documentation/architecture.md) for component boundaries and data flow.

Map tiles load from OpenStreetMap, property photos from their original provider, and fonts from Google Fonts. These features require internet access; no routing service or geocoding account is required. The map retains OpenStreetMap attribution. Review the [tile usage policy](https://operations.osmfoundation.org/policies/tiles/) before broader deployment.
