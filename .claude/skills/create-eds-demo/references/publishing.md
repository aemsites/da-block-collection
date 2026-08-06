# Validate & publish

## Validate the preview

The Edge Delivery preview URL construct:
```
https://{branch}--{repo}--{org}.aem.page/
```
Use `main` for `{branch}`. Example: `https://main--southwest--ynaka-adobe.aem.page/`

Verify for the user (don't ask them to eyeball it): fetch the URL, confirm HTTP 200 and that the migrated
content renders. Remember:
- Header/footer is a **separate block** — it may look unstyled until Phase 7 is done.
- Navigation is often best left for last.
- There should be **no errors**. If the page won't load or shows errors, go to `troubleshooting.md`.

## Publish (make it live)

Preview (`.aem.page`) is the staging view; the published/live domain is `.aem.live`:
```
https://{branch}--{repo}--{org}.aem.live/
```

To publish everything:
1. Use the **Traverse** app to get a list of all page URLs.
2. Copy/paste that list into the **Bulk Operations** app and run **Publish**.

Publishing is outward-facing and effectively makes the demo public (repos are Public). Summarize what will go
live and confirm with the user before they run the bulk publish.

## Optional extras

- **Generate Variations in the DA sidekick** — prompt aemcoder:
  ```
  Setup generate variations in my sidekick https://experienceleague.adobe.com/en/docs/experience-manager-learn/sites/document-authoring/how-to/generate-variations/configure-sidekick
  ```
- **Universal Editor for DA** — UE connects not to AEM but to a special DA endpoint
  `{branch}--{site}--{org}.ue.da.live` (cannot be loaded directly). See troubleshooting.md for enabling it.
