# Frequent Flyer Portal — Test Plan

## 1. Scope

Verify the browser-based passenger registry's main workflows, validation, storage behavior, analytics privacy, responsive layout, and accessible interaction patterns. This document describes acceptance criteria and commands; it does not claim that every check has been rerun for the latest commit.

## 2. Test environment

- React + TypeScript + Vite
- Vitest and React Testing Library for unit/component tests
- Playwright for browser end-to-end tests
- ESLint and TypeScript compiler for static checks

Install dependencies with `npm install`. Start the development server with `npm run dev` when performing manual browser checks.

## 3. Functional acceptance criteria

### Passenger records
- Create a passenger when all required fields are valid.
- Reject missing or malformed fields and show associated validation feedback.
- Enforce membership-number uniqueness when creating or editing a passenger.
- Edit an existing record without changing its identity or creation timestamp.
- Delete a record only after the user confirms the action.
- Refresh summary metrics after create, update, and delete operations.

### Search, filters, and states
- Search passenger records by name, email, or membership number.
- Combine search text with tier and status filters.
- Clearing filters restores the full list.
- Empty data and no-match results show the application's empty state.
- Loading and operation errors are communicated in the UI; retry is available for retryable load errors.

### Persistence and storage fallback
- With browser storage available, records persist across page reloads in `localStorage`.
- If storage is blocked or a write fails, the service switches to in-memory storage without crashing.
- When fallback mode is active, the dashboard displays a warning that changes are temporary and will be lost on reload or page close.
- Verify fallback behavior by blocking storage or simulating `SecurityError` / `QuotaExceededError`; do not assume fallback data survives a reload.

### Analytics privacy
- Successful create, update, delete, search/filter, and retry actions may emit the simulated console analytics event.
- The required message is `[Analytics] User interacted with End-to-End Frequent Flyer Portal`.
- Analytics metadata must not include passenger membership numbers, full names, or email addresses.
- Analytics is a simulated console logger, not a production telemetry integration.

### Accessibility and responsive behavior
- Use semantic page landmarks, labeled form controls, and clear loading/error announcements.
- Ensure keyboard access to interactive controls and appropriate modal close/focus behavior.
- Check the layout at desktop, tablet, and mobile widths; confirm no unintended viewport-level horizontal overflow.
- Automated accessibility checks cover selected behaviors only and do not by themselves establish WCAG conformance.

## 4. Test files

| File | Main coverage |
|---|---|
| `src/test/validation.test.ts` | Field validation and duplicate membership numbers |
| `src/test/sanitizer.test.ts` | Input sanitization |
| `src/test/storage.test.ts` | Persistence and in-memory fallback |
| `src/test/passengerService.test.ts` | Passenger CRUD and summary calculations |
| `src/test/analytics.test.ts` | Analytics message and metadata privacy |
| `src/test/connectivityAndErrors.test.tsx` | Offline/error states and retry behavior |
| `src/test/passengerCrud.test.tsx` | Dashboard workflows |
| `src/test/accessibility.test.tsx` | Selected accessibility behaviors |
| `e2e/` | Browser-level workflows (run with Playwright) |

The exact set and count of E2E tests may change as files are added or removed; use the runner output as the source of truth.

## 5. Verification commands

Run these from the project root:

```bash
npm test
npm run test:e2e
npm run lint
npx tsc --noEmit
npm run build
```

Record the date, command, exit status, and actual test counts after executing the checks. A previous run is not proof that a later code change has been verified.

## 6. Lighthouse audit

A formal Lighthouse score has **not** been recorded here. Do not report a target score as an achieved result.

To produce a measured report:

1. Start the app with `npm run dev` or build and serve it with `npm run build` followed by `npm run preview`.
2. Open the displayed local URL in Google Chrome.
3. Open DevTools, select **Lighthouse**, choose the device and categories to audit, and run the analysis.
4. Save the generated report and record the tested URL, device mode, date, and category scores here or alongside the report.

Lighthouse scores can vary by device, browser, build, and environment; report measured results rather than estimates.

## 7. Known product limitations

- Data is stored in the current browser only; there is no server database or cross-device synchronization.
- In-memory fallback data is volatile and is lost on reload or page close.
- Analytics events are console simulations.
- This test plan is not a substitute for a production security review or a formal accessibility audit.
