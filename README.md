# End-to-End Frequent Flyer Portal

A responsive React application for airline ground staff to manage frequent-flyer passenger records, membership tiers, points, and status. It includes passenger CRUD workflows, search and filters, summary metrics, input validation, and sanitized text inputs.

## Technology

- React 18, TypeScript, and Vite
- Tailwind CSS and Lucide React
- Vitest and React Testing Library for unit/component tests
- Playwright for browser end-to-end tests
- DOMPurify for input sanitization

## Local setup

Requirements: a supported Node.js version and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`).

## Useful commands

| Command | Purpose |
|---|---|
| `npm test` | Run Vitest tests once |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run test:e2e` | Run Playwright browser tests |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Check TypeScript types |
| `npm run build` | Type-check and create the production bundle |
| `npm run preview` | Preview the production bundle |

Playwright may require its browser binaries to be installed in a new environment. Follow the Playwright CLI instructions if the E2E command reports a missing browser.

## Project layout

- `src/components/`: dashboard, passenger table, summary cards, form modal, loading and error UI
- `src/services/`: passenger CRUD/business logic, browser storage, analytics logging, validation, and sanitization
- `src/test/`: unit, integration, storage, analytics, accessibility, and workflow tests
- `e2e/`: Playwright end-to-end tests
- `TEST_PLAN.md`: acceptance criteria and verification instructions
- `PROMPTS.md`: project prompt history

## Data persistence and privacy

- Passenger records are stored in the current browser's `localStorage` under `frequent_flyer_passengers`.
- If browser storage is blocked or a write fails, the application switches to an in-memory fallback and displays a warning. **Fallback data is temporary and will be lost when the page is reloaded or closed.**
- Data is not synchronized between browsers, devices, or staff members. This application does not include an authenticated server-side database; shared multi-user use requires a secure backend.
- Analytics are simulated through console logging. Passenger membership numbers, names, and email addresses are excluded from analytics metadata. Do not treat the simulated logger as a production analytics service.

## Accessibility and audit status

The interface uses semantic landmarks and form labels, and includes accessible error/loading states. Automated tests can check selected accessibility behaviors, but these checks do not establish WCAG conformance or a particular Lighthouse score.

**No measured Lighthouse score is claimed in this repository.** To measure the current build, run the app, open Chrome DevTools, select Lighthouse, choose the desired device and categories, then run the audit and save its generated report.

## Limitations

This project is a browser-local prototype, not a production multi-terminal airline system. Before production use, add an authenticated backend, authorization, server-side validation, appropriate audit logging, and a privacy/security review.
