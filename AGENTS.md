# Repository Guidelines

## Project Structure & Module Organization
- `index.html`, `services.html`, `service-detail.html`, `roi-calculator.html`: Page entries.
- `css/styles.css`: Global styles and design tokens.
- `js/`: Page logic (`main.js`, `services.js`, `service-detail.js`, `roi-calculator.js`).
- `images/`: Static assets.
- `.playwright-mcp/` and `test-screenshots-*`: Visual artifacts/screenshots used for verification.

## Build, Test, and Development Commands
- `npm install`: Install dependencies.
- `npm start`: Launch local dev server at `http://localhost:3000` (live reload via `live-server`).
- `npm run build`: No-op placeholder (static site). Keep artifacts committed.
- Playwright (optional): `npx playwright install` (first-time browser deps), `npx playwright test` (if tests are added).

## Coding Style & Naming Conventions
- HTML: Semantic elements; Tailwind-first utilities; prefer `data-*` hooks (e.g., `data-mobile-menu`).
- CSS: Keep custom styles in `css/styles.css`; 2-space indentation; use CSS variables declared in `:root`.
- JavaScript: Vanilla ES6+, 2-space indentation, `camelCase` for functions/vars, `UPPER_SNAKE_CASE` for constants; avoid global leakage; initialize in `DOMContentLoaded`.
- Filenames: kebab-case for assets; JS files are lower-case with hyphens (e.g., `service-detail.js`).

## Testing Guidelines
- Framework: Playwright supported via devDependencies.
- Location: Place e2e tests under `tests/` (e.g., `tests/homepage.spec.ts`).
- Naming: `*.spec.ts` or `*.spec.js`.
- Run: `npx playwright test` (use `--ui` or `--project=chromium` as needed).
- Screenshots: Commit stable comparison images when relevant; store under `tests/__screenshots__/`.

## Commit & Pull Request Guidelines
- Commits: Follow Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`). Keep messages imperative and scoped (e.g., `feat(roi): add ROI range validation`).
- PRs: Include concise description, linked issues, before/after screenshots for UI changes, and test notes (steps to verify locally). Small, focused PRs preferred.

## Security & Configuration Tips
- No secrets in repo; static site only. Use environment-independent, relative paths.
- Validate user input (e.g., URLs) and avoid inline event handlers where possible.
- Keep third-party assets to `devDependencies`; pin versions when upgrading.

