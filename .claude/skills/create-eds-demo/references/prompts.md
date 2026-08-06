# aemcoder prompt library

These are prompts the **user pastes into the aemcoder.adobe.io chat** (not into Claude Code). Customize each
with the customer's source URL / block names, present it in a copy-friendly code block, and wait for the user
to report the result before giving the next one.

General agent behavior to relay to the user:
- The agent follows structured workflows and **asks clarifying questions** — tell the user to answer them
  rather than front-loading everything into one giant prompt.
- Some skills depend on earlier output. **Migrate one page before bulk import** (bulk needs the import
  infrastructure the first page builds). **Do site-wide design before per-block CSS** (block CSS references the
  global design tokens).

## Project context files (do this first, optional but recommended)

Offer to create `CONTEXT.md` / `INSTRUCTIONS.md` in the repo capturing customer name, source URL, brand rules,
naming conventions, and content-mapping rules. aemcoder reads project markdown and follows it. Example:
```markdown
# CONTEXT.md
Customer: <name>
Source site: <url>
Brand: primary color <hex>, font <name>
Rules: prefer block variants over new blocks; keep header/footer out of page migration.
```

## Phase 5 — Content migration (start with ONE page)

Single page first:
```
Migrate the page <SOURCE_PAGE_URL> to EDS.
```
Then, after it succeeds, bulk:
```
Migrate these pages: <URL1>, <URL2>, <URL3> to EDS
```
What to expect: content blocks created with the most appropriate block name (variants preferred over new
blocks); **header, navigation, and footer are excluded** from page migration; each run adds to the import
infrastructure for future bulk imports.

## Phase 6 — Design & tokens

Design (two steps, in order):
```
Migrate Design from <SOURCE_URL> to EDS
```
- Step 1 migrates global color palette, accent colors, typography, spacing, background, base styles →
  outputs to `/styles/styles.css`.
- Step 2 migrates block-specific CSS using the global style → outputs to `/blocks/{name}/{name}.css`.

Design tokens (most sites expose CSS variables; extracting them is its own prompt):
```
Migrate Design Tokens from <SOURCE_URL> to EDS
```

## Phase 7 — Navigation, header/footer, block polish

The first import is usually basic — missing nav, footer, styling. Improve it:

Navigation:
```
Setup navigation from <SOURCE_URL>
```
or
```
Fix Navigation Menu
```
Expect a nav block in three sections: (1) Brand, (2) Sections / nav menu, (3) Utility links (login, cart, language).

Header/Footer: page migration excludes these, so the template's sample header/footer remains. In the repo open
`fragments/nav/header` and optionally: replace the logo with the customer's, remove the temporary `features`
include, rename list items to match the source site. Final header/footer/nav polish happens during block work.

Block enhancement — before prompting: be on `main` branch, open the content page to get the exact block name,
and inspect the source site for the element to match. Example prompt pattern:
```
please make the first section dark, content match the element
<CSS_SELECTOR_FROM_SOURCE> on <SOURCE_URL>
```

### Figma → block (optional, block-level only)
1. User creates a free figma.com account → **Settings → Security → generate a personal access token**.
2. In aemcoder **Settings**, paste the Figma token. (Token goes in the aemcoder UI, never into chat with you.)
3. In Figma, select the block → right-click **Copy/Paste as → Copy link to selection**.
4. Prompt:
```
Create new block <block-name> using figma file: <FIGMA_SELECTION_LINK>
```
Remind the user to stash (+) and push code when done.

## Phase 8 — Sync back to GitHub and DA

**Code → GitHub:** left menu **Code → Workspace changes** (top right). If files show "unstaged," click **+** to
stage them. **Push** offers `main` or a branch `pr-xxxx` (use a branch only if comfortable with Git / want a
versioned demo checkpoint). Pushing is outward-facing — confirm with the user first.

**Content → DA:** left menu **Content → Upload Content**. Validate the DA repo is correct. If the header was
manually edited, include it; otherwise select **index only** (usually the only modified document).

After syncing, validate the preview URL (see publishing.md).
