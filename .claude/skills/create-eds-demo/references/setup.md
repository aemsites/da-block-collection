# Setup: accounts, repo, content root, agent connection

Coach these phases one at a time. Verify the outcome before moving on.

## Phase 1 — One-time setup (first-timers only)

### GitHub personal account + org (needed for Edge Delivery admin tools)
1. Go to https://github.com → **Sign up** with the user's **Adobe email**; GitHub emails a validation code.
2. After login, open the menu next to the avatar → **Your organizations** → **New organization** →
   choose the **Free** plan.
3. **Org name = username + `-adobe`** (e.g. username `ynaka` → org `ynaka-adobe`). EDS admin tooling keys off
   this naming and off the Adobe email being in the org's contact email, so both must be set.
4. Choose **Personal Account** as the org owner. Add the Adobe email under the org's contact email.

> Why the `-adobe` org: the Edge Delivery admin service uses it to find the admin. Repos created inside this
> org get admin resolution "for free."

### Local tools
Run these to check; report each as ✅ present or ❌ missing:
```bash
git --version
node --version
aem --version
```
Install guidance if missing:
- **git** / **Node** — install Node (LTS) from https://nodejs.org (bundles npm); git from https://git-scm.com.
- **AEM CLI**: `sudo npm install -g @adobe/aem-cli`

> Claude cowork onboarding (optional): the enablement flow offers a cowork onboarding.md that auto-checks
> git / Claude / Node / AEM CLI. If the user has cowork, they can run that instead of the manual checks.

## Phase 2 — Create the customer repo from da-demo-kit

The template already bundles the demo functionality (Target integration, Workfront integration,
Send-to-Workfront approval/publish).

1. Open https://github.com/ynaka-adobe/da-demo-kit → **Use this template** → **Create a new repository**.
2. **Repository name** = customer / site name (lowercase, no spaces — e.g. `southwest`).
3. **Owner** = their personal `-adobe` org.
4. **Visibility** = **Public**.

### Faster path: create the repo with the `gh` CLI (offer this)
Before sending the user to the browser, check whether the GitHub CLI is available and authenticated:
```bash
gh auth status
```
If it reports a logged-in account, **offer** to create the repo for them (it's outward-facing — confirm first):
```bash
gh repo create <org>/<name> --template ynaka-adobe/da-demo-kit --public
```
Then confirm it exists:
```bash
gh repo view <org>/<name> --json name,url,isTemplate
```
If `gh` is missing or not authenticated, fall back to the browser steps 1–4 above. Either way, **Code Sync
must still be installed by the user in the browser** — `gh` cannot install a GitHub App.

Then install **AEM Code Sync** on the new repo (this installs the Edge Delivery microservices that run at the
edge — the modern replacement for the old AEM publish server):
5. Open https://github.com/apps/aem-code-sync → **Configure**.
6. Select the personal `-adobe` org → **Only select repositories** → pick the repo just created →
   **Install & Authorize**.

## Phase 3 — Create the DA content root

Content lives in Document Authoring (DA), separate from code.
- Root URL for an org: `https://da.live/#/{github-org}` (also where you delete a content repo to free a site name).
- **Preferred:** use the wizard at https://da.live/start
  1. Enter the newly created GitHub repo, click **Go**.
  2. On step 2, select **AEM Block Collection** (or None) — **do NOT use Author Kit** for this template.

## Phase 4 — Open the Experience Modernization Agent and connect

1. Open https://aemcoder.adobe.io/
2. First-time users get a **GitHub repository connection** popup — connect the repo just created.
   (Returning users: **Settings** lets you reset the workspace — deletes code/content connection and chat history.)
3. Run **Code Connector** (lets the AI agent interact with the code + content repos) and **Code Sync**
   (attaches event listeners between code and content repos), selecting the new repository.
4. Read the confirmation email carefully. If you get a **"could not find admin"** error, see
   `troubleshooting.md` (tip: the `-adobe` org + Adobe contact email fix this).

Once connected, the user is in the aemcoder console and ready to migrate — move to `prompts.md`.

## The UI console (orient the user)

Left menu has **Code** (workspace changes / push to GitHub) and **Content** (upload to DA). The main chat
window is where you paste migration prompts; it shows tasks (≈7 per migration) with real-time status.
