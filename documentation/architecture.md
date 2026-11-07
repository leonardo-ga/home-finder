# Application architecture

## Scope

The application is a single-user Angular frontend. The current feature is a rental-home shortlist. This refactor establishes boundaries for additional features without introducing a backend, a routing framework, or a third-party state-management library prematurely.

## Build and deployment boundary

The production build targets GitHub Pages branch publishing. `npm run build` writes static output directly into `docs/`; the output-path configuration disables Angular's additional `browser/` subdirectory. `docs/index.html` is therefore the published entry point.

The production base path is `/home-finder/`, matching `https://leonardo-ga.github.io/home-finder/`. Development keeps the root base path and a separate output location. The build copies `public/.nojekyll` to the deployment directory.

The generated `docs/` directory is committed with the source. GitHub Pages must be configured for **Deploy from a branch → main → /docs**. Deployment consists of validating, rebuilding, committing all generated changes, and pushing to `main`. The repository does not require a custom Actions workflow or a `gh-pages` branch.

Project documentation belongs in `documentation/`, because production builds replace `docs/`. Generated bundles are excluded from formatting. The release procedure is documented in the [README](../README.md#deploy-to-github-pages).

The hosted application remains frontend-only. Deployment does not copy browser data to GitHub or synchronize records across devices. Local development and GitHub Pages use different origins and therefore different browser databases; export a backup locally and import it on the hosted application when transferring a shortlist.

## Source layout

```text
src/
  app/
    app.component.ts                       Application shell
    core/storage/
      workspace.repository.ts              IndexedDB adapter
      backup-file.service.ts               Browser download adapter
    features/homes/
      domain/
        home.model.ts                      Types, constants and draft factory
        home.validation.ts                 Runtime validation and backup schema
        home.selectors.ts                  Filtering, sorting and comparison rules
        home.examples.ts                   Explicit demonstration data
        commute.ts                         External route-link construction
      data-access/
        homes.store.ts                     Feature state and mutation operations
      pages/
        homes-page.component.*             Page composition and UI workflows
      components/
        home-card/                         Property summary
        home-map/                          Leaflet lifecycle and markers
        home-details/                      Selected property and route links
        home-comparison/                   Comparison table
        home-editor/                       Isolated property draft
        destinations-editor/               Isolated commute-settings draft
    shared/
      money.ts                             Reusable currency formatting
      dialog-focus.directive.ts            Modal keyboard focus behavior
  styles.css                               Tokens, elements and shared primitives
  styles/dialogs.css                       Shared modal layout
  styles/map-markers.css                   Leaflet-generated marker markup
```

## Dependency rules

1. Domain modules must remain independent of Angular, the DOM, Leaflet, and IndexedDB. They accept values and return values or validation errors.
2. Only the repository may open IndexedDB. The database name, version, object store, and record key are infrastructure concerns.
3. The feature store owns persisted workspace state, filters, selection, comparison, and persistence status. State changes must pass through its methods. Do not mutate values returned by a selector.
4. The page coordinates confirmations, modal visibility, file selection, and store operations. It must not implement validation rules or database transactions.
5. Presentational components receive typed inputs and emit typed events. They must not inject the feature store or repository.
6. Editors clone their inputs. Closing an editor without saving must leave persisted state unchanged.
7. Component-specific CSS belongs beside its component. Global CSS is reserved for tokens, basic controls, shared primitives, and third-party generated markup.

The map is an integration component: it owns the Leaflet instance and its browser resources, but it cannot mutate property records. It renders only when relevant inputs change, runs map activity outside Angular's zone, and emits selection events inside the zone. It disconnects its resize observer and removes the map on destruction.

## Data flow

```text
UI event -> page -> store mutation -> runtime validation -> updated signals
                                       |
                                       +-> serialized repository write
                                                |
                                                +-> transaction completion -> save status

store computed selectors -> component inputs -> rendered interface
```

Filtering and comparison use memoized computed signals. Components use stable property identifiers for list rendering. Presentational components use `OnPush` change detection.

## Persistence and error handling

- Workspace initialization runs once per feature-store instance. Mutations before initialization are rejected, and the main workspace remains inert while loading.
- Storage reads and writes complete at the IndexedDB transaction boundary.
- Writes are queued in mutation order. A stale write cannot replace the latest operation's status message.
- Write failures retain the current in-memory state and display an unsaved status. A later successful mutation retries persistence with the complete current snapshot.
- Unreadable or invalid stored data is protected from automatic replacement. The session remains in memory and requires backup export; recovery of the stored data is a separate operation.
- Selection and comparison references are pruned after deletion or example removal.
- This remains a single-tab persistence model. Concurrent tabs do not merge changes; the last completed write wins.

## Validation and compatibility

Form submissions, imported backups, and stored records use the same runtime home contract. Validation rejects non-finite values, invalid coordinates, non-integer room/bathroom/floor counts, duplicate identifiers, unsupported statuses and travel modes, and malformed or non-HTTP(S) links.

JSON is treated as `unknown` at the application boundary. Imported records are reconstructed from known fields, validated before state replacement, and defensively copied.

The existing IndexedDB schema is retained: database `home-finder`, version `1`, object store `settings`, key `data`. Existing unversioned workspace records and version-1 JSON backups remain readable when valid. The omitted travel mode in older backups defaults to `transit`; new exports retain the selected mode. Invalid legacy records are rejected rather than silently corrected or discarded.

## Extension points

- **Automatic commute estimates:** introduce a commute provider adapter and feature state for loading, errors, departure time, results, and caching. Components must not call a routing provider directly. Secret credentials require an appropriate server boundary.
- **Purchase listings:** model transaction type explicitly and provide separate cost rules. Do not reinterpret the existing monthly-rent field.
- **Remote persistence:** replace or extend the repository boundary, and define identity, synchronization, and conflict behavior before adding network writes.
- **Additional screens:** introduce route-level feature pages when independent navigation is required. Do not add unrelated features to the homes store.
- **Schema changes:** introduce an explicit migration before changing the persisted or exported record contract. Retain compatibility tests for supported historical formats.

## Verification

```sh
npm test
npm run build
npm run format:check
```

Tests compile under TypeScript's strict settings and exercise domain rules, state transitions, write failures, write ordering, legacy backup compatibility, and IndexedDB transactions using `fake-indexeddb`. Angular is loaded directly for store tests; its decorators and signal implementation are not mocked.

The test runner uses Node's built-in test framework and a Node 18 compatibility flag for extensionless emitted ES module imports. This produces an experimental-resolution warning on Node 18; it does not suppress test failures.

The production build checks Angular templates. Automated browser interaction and visual regression tests remain outstanding; neither unit tests nor compilation establishes browser-layout correctness.
