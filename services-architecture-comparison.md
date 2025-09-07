# Services Architecture Options — Comparison & Migration Plan

## Executive Summary

The current custom Services pages (static HTML + dynamic JS loader) work but are fragile, costly to maintain, and duplicate functionality WooCommerce already provides. Given you have “almost ready” WooCommerce pages, the highest‑leverage move is to swap the Services listing and detail experiences to native WooCommerce pages while keeping the static marketing/ROI pages. This reduces tech risk, speeds up time‑to‑market, and standardizes cart/checkout.

Recommended path: Adopt “Hybrid WooCommerce” — link/route Services list and product detail to WooCommerce (under the same domain via reverse proxy or subpath), keep `index.html` and `roi-calculator.html` as they are. Add 301 redirects from static Services URLs to WooCommerce permalinks. Phase out custom JS for Services.

---

## Current State (Baseline)

- Pages: `services.html`, `service-detail.html` use static markup + `js/services-dynamic.js` (WooCommerce REST fallback), filtering, tags, and a custom cart.
- Pros:
  - Full control over markup and UX
  - Fast static hosting, easy to deploy
  - Can brand and experiment freely
- Cons:
  - Data sync/API fragility (timeouts, empty states, cache)
  - Duplicate business logic (filters, pagination, cart)
  - Maintenance cost; more surface area for bugs
  - Checkout/cart lives outside WooCommerce’s native flow

---

## Option A — Keep Custom Services (Improve Current)

- What: Continue with `services.html` + `services-dynamic.js`, harden API fallback, and extend cart integration.
- Pros:
  - Maximum design/control
  - No WordPress theming required
- Cons:
  - Ongoing engineering complexity (filters, sorting, pagination, variants)
  - Harder to reach WooCommerce parity (bundles, coupons, shipping/taxes if needed)
  - Dev time siphoned from growth features
- Effort: Medium–High (recurring)
- When to choose: Only if WooCommerce pages are not viable in the near term.

---

## Option B — Swap To Native WooCommerce Pages (Simple Link‑Out)

- What: Replace `services.html` and `service-detail.html` with links to WooCommerce category archive and single product pages (existing/“almost ready”). Keep static homepage and ROI.
- Pros:
  - Immediate reduction in complexity; use WooCommerce’s stable product lists, filters, search, variations, and checkout
  - Removes API timeout/fallback logic
  - Native cart/checkout and order flow
- Cons:
  - Visual consistency requires theming the WordPress site (header/footer, fonts, buttons)
  - If on another host/domain, cross‑domain UX/SEO considerations
- Effort: Low–Medium (theming + linking)
- When to choose: You have WooCommerce pages nearly ready and can accept a subdomain or separate path.

---

## Option C — Hybrid WooCommerce Under Same Domain (Recommended)

- What: Serve WooCommerce under a subpath (e.g., `/shop`), via reverse proxy (Nginx/Cloudflare/Netlify) so URLs are first‑party. Keep static marketing pages in this repo.
- Pros:
  - Best balance of speed + maintainability
  - One domain for SEO and analytics
  - Minimal code in this repo; WooCommerce handles services logic
  - Easy A/B testing on static pages; stable commerce on WooCommerce
- Cons:
  - Requires reverse proxy config and a touch of WooCommerce theming
- Effort: Medium (1–3 days to theme and proxy)
- When to choose: You want native WooCommerce flows with a unified brand/domain.

---

## Option D — Headless (Next.js/Astro) with WooCommerce REST/GraphQL

- What: Pre‑render services and product detail from WooCommerce into a static/JAMStack app.
- Pros:
  - Top‑tier performance and design control
  - SEO‑friendly static pages, can hydrate for interactivity
- Cons:
  - Highest complexity; essentially a new front‑end stack
  - Checkout/cart still requires careful server integration
- Effort: High (multi‑week)
- When to choose: Later, if you need maximum scale and custom UI.

---

## Comparison (Pros/Cons Snapshot)

- Custom (Keep):
  - Pros: Control, speed, experimentation
  - Cons: High maintenance, duplicated features, fragile API
- Native WooCommerce (Link‑Out):
  - Pros: Fastest stabilization, native cart/checkout
  - Cons: Theming and potential cross‑domain considerations
- Hybrid (Same Domain via Proxy):
  - Pros: Unified SEO/analytics, maintainability, minimal code here
  - Cons: Proxy + light theming required
- Headless:
  - Pros: Performance, control, future‑proofing
  - Cons: Big build, not the fastest path to value

---

## Impact On Structure & Systems

- URLs & SEO:
  - Replace `services.html` with `/shop/` (category archive) and `service-detail.html?id=…` with WooCommerce product permalinks.
  - 301 redirects from legacy static URLs to WooCommerce URLs to preserve SEO equity.
- Cart & Checkout:
  - Use WooCommerce’s cart/checkout. Remove or shim the custom `window.marketBoostCart` for ROI recommendations by deep‑linking to `?add-to-cart=PRODUCT_ID`.
- Analytics:
  - Ensure GA/Pixel tags are present on WooCommerce templates. Keep event names consistent (`add_to_cart`, `begin_checkout`, etc.).
- Design/System:
  - Port CSS variables/fonts to the WooCommerce theme to match look/feel.
  - Header/Footer parity: add a shared header partial or replicate nav in theme.
- Testing:
  - Keep Playwright tests for static pages. For WooCommerce, either create a separate test suite hitting the proxied `/shop` routes or smoke test via headless browser using a staging store.

---

## Migration Plan (Hybrid WooCommerce — Recommended)

1) Decide URL Strategy
   - Preferred: Reverse proxy WooCommerce under `/shop` (same domain). Alternative: Use `shop.example.com` with HSTS and GA cross‑domain linking.

2) Theme Alignment (WooCommerce)
   - Apply brand tokens (colors, fonts) and buttons to WooCommerce theme.
   - Add header/footer to match `index.html` (replicate or include via theme partials).

3) Link & Redirects
   - Change CTAs to `/shop/` (list) and product URLs where needed.
   - Add 301s:
     - `/services.html` → `/shop/`
     - `/service-detail.html?id=123` → WooCommerce product permalink.

4) ROI Integration
   - Replace ROI “Add to Cart” with links to `/shop/?add-to-cart=PRODUCT_ID` (or cart REST) for native cart.
   - Optional: “View in Services” link → `/shop/category/<slug>` (replaces `?preselect=`).

5) Analytics & Events
   - Verify GA4/Pixel installed on WooCommerce. Keep event names consistent with static site.
   - Add checkout funnel events in WooCommerce (plugins or GTM).

6) QA & Launch
   - Smoke test product listing, filters, product detail, add to cart, checkout.
   - Validate redirects and canonical URLs.
   - Monitor error logs and page speed.

7) Decommission Old Services Code
   - Remove `js/services.js` and `js/services-dynamic.js` usage.
   - Keep legacy HTML as backup for one sprint (rename to `*.legacy.html`).

---

## Effort & Timeline (Typical)

- Day 1: Proxy + theme header/footer + link CTAs
- Day 2: Redirects + analytics parity + ROI add‑to‑cart deep links
- Day 3: QA + polish + remove legacy Services scripts

---

## Risks & Mitigations

- Visual drift between static and WooCommerce pages
  - Mitigation: Share CSS variables; lightweight theme styling; visual QA checklists
- Cross‑domain cookies/analytics (if subdomain)
  - Mitigation: Same‑domain proxy; or GA cross‑domain linking + consistent cookie settings
- SEO loss on URL changes
  - Mitigation: 301 redirects and proper canonicals; resubmit sitemap

---

## Decision & Recommendation

Adopt Option C (Hybrid WooCommerce under the same domain). It’s the fastest, safest way to get fully functional Services with native cart/checkout while preserving your static marketing stack. Use redirects to protect SEO, port your brand styles to the WooCommerce theme, and deep‑link ROI actions to WooCommerce cart.

If time is extremely constrained, Option B (simple link‑out to WooCommerce on a subdomain) is acceptable as a short‑term bridge; schedule the proxy+theming work next.

