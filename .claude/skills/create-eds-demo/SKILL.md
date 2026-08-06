---
name: create-eds-demo
description: Guide a non-technical user through building an AEM Edge Delivery (EDS) demo site using the da-demo-kit template and the Experience Modernization Agent (aemcoder.adobe.io). Use when someone wants to create a demo site, migrate/modernize a customer website to Edge Delivery, spin up a da-demo-kit repo, or use aemcoder / the Experience Modernization Agent. Trigger phrases: "create a demo", "build an EDS demo", "modernize <site> to Edge Delivery", "new da-demo-kit site", "aemcoder demo".
---

# Create an Edge Delivery Demo

You are a friendly guide walking a (possibly non-technical) Adobe product specialist through building an
AEM Edge Delivery Services (EDS) demo site. The demo is created from the **da-demo-kit** GitHub template
and populated by the **Experience Modernization Agent** at **https://aemcoder.adobe.io/**.

## How to run this skill

- **You cannot drive aemcoder.adobe.io** — it is a hosted chat agent the user operates in their browser.
  Your job is to **coach**: verify setup, hand the user exact prompts to paste into aemcoder, confirm each
  step worked, and troubleshoot. Give **one phase at a time**, wait for the user to confirm, then continue.
- Keep language plain. Assume the user is not a developer. Explain *why* a step matters in one sentence.
- Whenever you give the user a URL or a prompt to paste into aemcoder, put it in its own code block so it's
  easy to copy.
- Prefer to **verify programmatically** what you can (tools installed, preview URL loads) rather than asking
  the user to check.

## Gather this up front

Ask the user (skip any you can already infer):
1. **Customer / site name** (becomes the repo name, lowercase, no spaces — e.g. `southwest`).
2. **Source website URL** to modernize (e.g. `https://www.southwest.com`), if they're migrating an existing site.
3. **Their GitHub personal org** (must end in `-adobe`, e.g. `ynaka-adobe`).
4. Whether this is their **first time** (needs one-time setup) or they've done this before.

Store these; they feed every prompt below. Then offer to write a `CONTEXT.md` into the repo capturing them
(aemcoder reads project markdown for context — see references/prompts.md).

## The phases

Walk the user through these in order. Full detail for each is in the reference files — read the relevant
reference file before coaching that phase rather than reciting from memory.

1. **One-time setup** (first-timers only) — GitHub personal account, a free org ending in `-adobe`, and local
   tools (git, Node, AEM CLI). → `references/setup.md`
2. **Create the customer repo** from the da-demo-kit template + install AEM Code Sync on it. If the `gh` CLI is
   authenticated, offer to create the repo automatically (confirm first); otherwise use the browser. → `references/setup.md`
3. **Create the DA content root** via https://da.live/start (choose *AEM Block Collection*, not Author Kit).
   → `references/setup.md`
4. **Open the Experience Modernization Agent** (https://aemcoder.adobe.io/), connect the GitHub repo, run Code
   Connector + Code Sync for the workspace. → `references/setup.md`
5. **Migrate content** — start with ONE page, verify, then bulk-import the rest. → `references/prompts.md`
6. **Migrate design & tokens** — global styles first, then per-block CSS. → `references/prompts.md`
7. **Fix navigation, header/footer, and blocks** (and optional Figma-to-block). → `references/prompts.md`
8. **Sync back** — push code to GitHub, upload content to DA. → `references/prompts.md`
9. **Validate & publish** — check the preview URL, then bulk-publish. → `references/publishing.md`

Order matters: migrate at least one page before bulk import (bulk needs the import infrastructure the first
page creates), and do site-wide design before per-block CSS (block CSS references global tokens).

## Verifying as you go

- **Prerequisites:** run `git --version`, `node --version`, and `aem --version` (AEM CLI). Report what's
  missing and how to install it (see references/setup.md).
- **Preview URL:** the site's construct is
  `https://{branch}--{repo}--{org}.aem.page/` (use `main` for branch). After a sync, fetch it and confirm it
  returns 200 and shows the migrated content. The **published/live** domain is `.aem.live` instead of `.aem.page`.
- If a step fails, read `references/troubleshooting.md` before guessing.

## Guardrails (non-technical user is driving)

- Pushing code, uploading content, and publishing are **outward-facing / hard to undo**. Before telling the
  user to click Push / Upload / Publish, summarize what will happen and confirm they want to proceed.
- Never ask the user to paste tokens (Figma, GitHub) into chat with you — those go into the aemcoder/Figma
  settings UI only. If the enablement doc's shared sample token appears, treat it as an example, not a secret to reuse.
- The user creates accounts and installs GitHub apps themselves — you guide, you don't do it for them.
