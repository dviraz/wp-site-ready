# Tasks

Persistent task list for this repo. Use these sections to track work across Codex sessions so tasks don’t disappear when the CLI restarts.

## In Progress
- [ ] (none)

## Backlog
- [ ] Verify /wp-json proxy works on Vercel (Chromium test)
- [ ] Confirm product/category endpoints are public on synergyx.digital
- [ ] Validate ROI deep links resolve to /shop on synergyx.digital
- [ ] Add doc: local vs prod API behavior (relative paths)
- [ ] Optional: add Playwright smoke test for /shop and ROI add-to-cart
- [ ] Add items here. Example template:
  - Title: Short, imperative summary
  - Context: Why it matters; links to issues/PRs
  - Acceptance criteria:
    - [ ] Criterion 1
    - [ ] Criterion 2
  - Owner: @name
  - Notes: Any caveats or follow-ups

## Done
- [2025-09-08] Add persistent TASKS.md to track work
- [2025-09-08] Route WooCommerce API via Vercel `/wp-json/wc/v3` in production; keep localhost proxy in dev
- [2025-09-08] Update cart sync base URL to match prod/dev logic
- [2025-09-08] Rebuild static output to `public/`
- [2025-09-08] Commit changes (`feat(integrations): route WooCommerce API via Vercel rewrites and add persistent TASKS.md`)
- [2025-09-08] Verify add-to-cart via deep links is working

Guidelines
- Use short, imperative titles (e.g., "Implement ROI range validation").
- Move items between sections instead of deleting.
- When completing, copy the title to Done with a date (YYYY-MM-DD).
- If you want Codex to mirror the current plan here, just say: "mirror plan to TASKS.md".
