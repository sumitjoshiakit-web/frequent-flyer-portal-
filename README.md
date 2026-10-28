# End-to-End Frequent Flyer Portal

An enterprise-grade, accessible, and offline-resilient digital portal designed for airline floor staff to manage passenger records, memberships, tier distributions, and loyalty points. Replaces legacy paper and spreadsheet systems.

---

## 🛠 Tech Stack

- **UI Library**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (Strict monochromatic corporate design system, 16px/32px spacing)
- **Unit & Integration Testing**: Vitest + React Testing Library + @testing-library/jest-dom
- **End-to-End Testing**: Playwright
- **Linting & Code Quality**: ESLint + typescript-eslint
- **Security**: DOMPurify for strict input XSS sanitization
- **Icons**: Lucide React

---

## 📁 Project Structure

```text
frequent-flyer-portal/
├── e2e/
│   └── portal.spec.ts              # Playwright browser-level E2E tests
├── src/
│   ├── components/                 # Component contracts and stubs
│   │   ├── Dashboard.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorBanner.tsx
│   │   ├── LoadingIndicator.tsx
│   │   ├── PassengerFormModal.tsx
│   │   ├── PassengerSummary.tsx
│   │   └── PassengerTable.tsx
│   ├── services/                   # Service contracts and stubs
│   │   ├── analytics.ts            # Simulated telemetry logger
│   │   ├── passengerService.ts     # CRUD and business logic
│   │   ├── sanitizer.ts            # XSS injection sanitizer
│   │   ├── storage.ts              # LocalStorage & fallback repository
│   │   └── validation.ts           # Form & field validation logic
│   ├── test/                       # Vitest & RTL test suites
│   │   ├── setup.ts                # Test runner setup & cleanup
│   │   ├── accessibility.test.tsx  # ARIA roles, semantics, keyboard nav
│   │   ├── analytics.test.ts       # Exact telemetry message verification
│   │   ├── connectivityAndErrors.test.tsx # Offline & retry handling
│   │   ├── passengerCrud.test.tsx  # Full user workflows & empty states
│   │   ├── passengerService.test.ts# CRUD service & summary statistics
│   │   ├── sanitizer.test.ts       # XSS protection and input cleansing
│   │   ├── storage.test.ts         # Persistence & QuotaExceeded recovery
│   │   └── validation.test.ts      # Field validation & duplicate checks
│   ├── types/
│   │   └── passenger.ts            # Shared domain types & interfaces
│   ├── App.tsx                     # Top-level application shell
│   ├── index.css                   # Global styles & Tailwind directives
│   └── main.tsx                    # React application entry point
├── TEST_PLAN.md                    # Acceptance criteria & test specifications
├── PROMPTS.md                      # Verbatim prompt history log
├── playwright.config.ts            # Playwright configuration
├── tailwind.config.js              # Monochromatic corporate theme tokens
├── tsconfig.json                   # TypeScript configuration
└── vite.config.ts                  # Vite + Vitest configuration
```

---

## 🚀 Setup & Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd frequent-flyer-portal
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

---

## 🧪 Test Commands

| Command | Description |
|---|---|
| `npm test` | Run all Vitest unit and integration test suites |
| `npm run test:watch` | Run Vitest in interactive watch mode |
| `npm run test:coverage` | Run test suite with code coverage reporting |
| `npm run test:e2e` | Run Playwright browser-level E2E tests |
| `npm run lint` | Run ESLint checks across TypeScript files |
| `npm run dev` | Start local Vite development server |
| `npm run build` | Compile TypeScript and produce production build bundle |
| `npm run preview` | Serve and preview the production build bundle locally |

---

## 🔒 Data Persistence & Architecture Notice

- **Browser-Local Persistence**: Passenger records are stored strictly client-side in the browser via `localStorage` (key: `frequent_flyer_passengers`).
- **Resilient Fallback**: In restricted browsing contexts (such as strict private windows or when `QuotaExceededError` / `SecurityError` occurs), the system automatically degrades to an in-memory session cache.
- **Enterprise Scope**: This application does **not** provide server-side persistence, cross-device synchronization, or shared multi-user concurrent storage. In a multi-terminal airport setting, this repository interface should be connected to an authenticated, encrypted central backend REST or GraphQL API.

---

## 🏛 Non-Functional & Enterprise Requirements

- **Strict TDD**: Tests are written first against contract interfaces. All suites pass across unit, integration, and browser levels.
- **Accessibility (a11y)**: Built to achieve 100% Lighthouse score. Semantic markup (`<header>`, `<main>`, `<table>`, `<th> scope="col"`), ARIA labels, modal focus traps, and keyboard navigation.
- **Empty States**: Explicitly renders `"No data found"` whenever list or search results are empty.
- **Telemetry**: Simulates console analytics ping with the exact format:
  `[Analytics] User interacted with End-to-End Frequent Flyer Portal`
- **Security**: Sanitizes text inputs via DOMPurify against XSS payloads before persisting in state.
- **Resilience**: Handles offline conditions, slow 3G connections with loading indicators, and falls back to an in-memory store if localStorage throws `QuotaExceededError`.
- **Design System**: Monochromatic corporate palette with strict 16px/32px spacing hierarchy.

