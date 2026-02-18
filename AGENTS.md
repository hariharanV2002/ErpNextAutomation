# Repository Guidelines

## Project Structure & Module Organization
- `specs/`: Playwright test suites by module (for example `specs/item/`, `specs/manufacturer/`, `specs/itemManufacturer/`).
- `pages/`: Page Object Model classes (`pages/common/`, `pages/item/`, `pages/auth/`, etc.).
- `flows/`: Business flows that orchestrate page actions and assertions.
- `selectors/`: Central selector registry (`selectors.ts`). Keep selectors here; do not hardcode selectors in specs.
- `fixtures/`: Static test config and messages (`*.json`).
- `data/`: Runtime-generated records (created entities used by dependent tests).
- `auth/`: Global setup and session bootstrap (`global.setup.ts`).
- `utils/`: Factories, types, data store helpers, and reusable utilities.

## Build, Test, and Development Commands
- `npm run typecheck`: Validate TypeScript types (`tsc --noEmit`).
- `npm test`: Run all Playwright tests headless.
- `npm run test:ui`: Run tests in Playwright UI mode.
- `npm run test:headed`: Run tests headed (browser visible).
- `npm run test:item`: Run item module only.
- `npm run show-report`: Open the latest Playwright report.

## Coding Style & Naming Conventions
- Language: TypeScript (`commonjs`).
- Use 2-space indentation and semicolons.
- Keep files focused: selectors in `selectors/`, UI actions in `pages/`, workflows/assertions in `flows/`.
- Naming:
  - Specs: `*.spec.ts`
  - Page objects: `*Page.ts`
  - Flows: `*Flow.ts`
  - Factories/helpers: descriptive camelCase exports.
- Prefer reusable methods in `CommonPage`; avoid duplicate interaction logic.

## Testing Guidelines
- Framework: `@playwright/test`.
- Follow scenario order when applicable: negative validations first, then positive create/search verification.
- Use generated data from factories (`faker`/random) and persist created records in `data/*.json` when needed for dependent suites.
- Assert stable UI outcomes (dialog/toast/list row) with tolerant matching for minor text variations.

## Commit & Pull Request Guidelines
- No Git history is available in this workspace; use Conventional Commits:
  - `feat: ...`, `fix: ...`, `test: ...`, `chore: ...`
- PRs should include:
  - Scope summary (module and flow changed)
  - Test evidence (command run + pass/fail summary)
  - Screenshots/video links for UI behavior changes
  - Any config updates (`.env.example`, `playwright.config.ts`, selectors).

## Security & Configuration Tips
- Keep credentials in `.env`; never hardcode secrets in specs/pages.
- Update `.env.example` when adding new environment variables.
- Reuse authenticated state from global setup; do not implement per-test login unless required.
