# Troubleshooting & advanced

## "Could not find admin" error (after Code Sync)
The Edge Delivery admin service resolves the admin from the GitHub org. Fixes:
- The repo's org must be the personal org ending in **`-adobe`** (e.g. `ynaka-adobe`).
- The user's **Adobe email** must be set as the org's contact email.
- Creating a repo in the correctly-named org retroactively fixes previously-created repos.

## Preview page won't load / shows errors
- Confirm Code Sync is installed on the repo and the last push to `main` succeeded.
- Confirm content was uploaded to DA (index at minimum).
- Header/footer being unstyled is expected before Phase 7 — that's not an error.
- Re-check the URL construct: `https://main--{repo}--{org}.aem.page/`.

## Universal Editor doesn't work on the preview
The da-demo-kit / AuthorKit project uses DA (Document Authoring) with a custom `ak.js` framework rather than
the standard `aem.js`, so UE is not wired up by default. Enabling UE requires:
1. `component-definition.json` — which blocks are available for authoring.
2. `component-models.json` — the authoring fields per block.
3. `component-filters.json` — which components go in which sections.
4. UE meta tags in `head.html` (e.g. `urn:aem:editor:aemconnection`, CORS config).
5. `data-aue-*` instrumentation attributes on each block's JavaScript (inline editing).

Prompt aemcoder:
```
Setup UE support for this project
```
It will likely reply with a confirmation and a next step. Read its message and reply:
```
continue
```
For DA-based UE, the editor URL is:
`https://experience.adobe.com/#/@acsmarketing/aem/editor/canvas/main--{repo}--{org}.ue.da.live/`

Alternative (Cursor): paste `https://docs.da.live/developers/reference/universal-editor` into Cursor's chat and
it will add the UE configuration.

## Templates reference
- `da-demo-kit` (this workflow's template): https://github.com/ynaka-adobe/da-demo-kit — bundles Target /
  Workfront demo functionality.
- `author-kit` (latest EDS-team template, least setup): https://github.com/aemsites/author-kit
- `aem-boilerplate`: https://github.com/adobe/aem-boilerplate
- `da-block-collection`: https://github.com/aemsites/da-block-collection

## Version history
aemcoder gives limited visibility into version history. Cursor (clone the repo, use its Git history panel)
gives easier access to changes if the user needs to inspect or roll back.

## Cursor as an alternative editor (advanced)
1. https://cursor.com → sign in → download desktop editor. For Adobe Enterprise, Composer 1.5 is free.
2. **Clone Repo** → paste the repo URL (e.g. `https://github.com/{org}/{repo}`).
3. Open a Terminal → `aem up` → opens `localhost:3000`. Content (md) comes from the preview site; decorations
   from the checked-out branch.
4. Git basics: Commit (local), Push (to cloud), Fetch/Pull (from cloud), Branch (isolated copy).
