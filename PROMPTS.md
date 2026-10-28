# Prompt History

## Prompt 1 (Initial Prompt)

```text
Slack Message / Context:

> *"Hey team, the client reached out to us today. Currently, their staff is managing end-to-end frequent flyer portal using manual paper systems and Excel sheets, which is causing massive data loss and operational slowdowns. They need us to build a digital End-to-End Frequent Flyer Portal that their floor staff can pull up easily. Please take point on this ticket. Focus on getting the core logic working first, and make sure we handle edge cases properly so it doesn't crash if they have a spotty internet connection."*

Technical Requirements Document (TRD)
Technical Requirements

1. Agile User Stories (The "Happy Path")
•
As a user, I want to be able to access the End-to-End Frequent Flyer Portal interface clearly so I can accomplish my primary task.
•
As a user, I want the system to respond immediately to my inputs without long loading screens.
•
As a manager, I want the data to be structured consistently so I can rely on the outputs.

2. The "Unhappy Path" (Edge Case Handling)
Real engineering focuses on what happens when things break. Your implementation MUST handle the following failure states:

•
Empty States: If a list or search result is empty, do not show a blank screen. Display a user-friendly "No data found" message.
•
Bad Connectivity: Assume the user might be on a slow 3G connection. Ensure there is a visual loading indicator during any asynchronous operations.
•
Invalid Inputs: If the user attempts to submit a form with missing or malformed data, prevent the submission and highlight the offending fields in red.

3. Non-Functional Requirements (NFRs)
Enterprise applications must adhere to strict quality standards before they can be merged.

•
Accessibility (a11y): You must achieve a 100% Lighthouse accessibility score. All interactive elements (buttons, inputs) must have appropriate ARIA labels and be keyboard navigable.
•
Telemetry Simulation: Add a simulated analytics ping. Log a specific message to the console (e.g., [Analytics] User interacted with End-to-End Frequent Flyer Portal) whenever a primary action is completed.
•
Security: Sanitize all text inputs against XSS injection before storing them in state.

4. Technical Implementation Notes
•
Tech Stack: Final Polish (Capstone 4)
•
Constraint: Execute a code freeze. Run accessibility audits, ensure Lighthouse scores exceed 90, and prepare the production build artifacts.
•
Design Handoff: Adhere strictly to a clean, monochromatic corporate design system. Do not introduce rogue hex colors. Maintain consistent padding (e.g., 16px/32px steps).


>  write the test suite first (using Jest or Vitest) to verify these criteria
 

You are the lead software engineer for an enterprise-grade Frequent Flyer Portal project.

We are starting from a completely empty project directory. Follow strict Test-Driven Development (TDD). Do not implement the actual application features yet.

PROJECT REQUIREMENTS:
Build an accessible, responsive End-to-End Frequent Flyer Portal for airline floor staff.

TECH STACK:
- React
- TypeScript
- Vite
- Tailwind CSS
- Vitest
- React Testing Library
- jest-dom matchers
- ESLint
- Playwright for browser-level tests where appropriate

CORE FEATURES TO TEST:
1. Dashboard with a passenger summary and passenger records table.
2. Create, read, update, delete and search passenger records.
3. Unique frequent flyer membership numbers.
4. Passenger fields: full name, email, membership number, tier, points and status.
5. Form validation for missing, malformed and duplicate values.
6. Empty states displaying a clear "No data found" message.
7. Loading indicators for asynchronous operations.
8. Graceful handling of offline mode, slow connections, failed operations and retryable errors.
9. Persistence across page reloads, with clear handling of unavailable storage.
10. Text input sanitization and safe rendering to prevent XSS.
11. Accessible labels, keyboard navigation, focus handling and semantic HTML.
12. A console analytics event after each successful primary user action, using this exact message:
[Analytics] User interacted with End-to-End Frequent Flyer Portal
13. Responsive layout and a monochromatic corporate design system.
14. No hardcoded API secrets or sensitive personal data.

YOUR TASK FOR THIS PHASE — TESTS FIRST:
A. Initialize the minimal React + TypeScript + Vite project structure.
B. Install and configure the necessary testing and linting dependencies.
C. Create a comprehensive test plan and acceptance criteria.
D. Write automated tests for the requirements above BEFORE implementing application features.
E. Organize tests into logical files covering validation, passenger CRUD, persistence, connectivity/error states, accessibility and analytics.
F. Where a test requires application modules that do not yet exist, write the tests against clearly defined expected interfaces. Do not create fake implementations just to make the tests pass.
G. Run the tests and report the expected failures caused by missing implementation separately from configuration errors.
H. Do not weaken, skip, or delete a meaningful test merely to obtain a passing result.
I. Create PROMPTS.md in the project root. Record this exact initial prompt as the first prompt in the log. Record subsequent prompts verbatim as they are actually used. Never invent a prompt history.
J. Create or update a README.md with project setup and test commands.

IMPORTANT RESTRICTIONS:
- Do not build the dashboard or implement passenger CRUD logic yet.
- Do not claim that tests pass unless they actually pass.
- Do not commit or push to GitHub.
- Do not deploy to Vercel.
- Do not add real API credentials.
- Preserve a clean, professional monochromatic design direction for the later implementation phase.

When finished, report:
1. Files created.
2. Dependencies installed.
3. Test files and scenarios covered.
4. Exact commands executed and their actual results.
5. Which failures are expected because implementation is missing.
6. Any blockers requiring my attention.

Stop after completing this test-first phase and wait for my next instruction.
```

## Prompt 2

```text
> write the actual implementation to make the tests pass

Continue working in the existing Frequent Flyer Portal workspace. The test-first phase is complete.

Implement PHASE 1: CORE BUSINESS LOGIC ONLY.

STRICT RULES:
- Read the existing source files, tests, package.json, TEST_PLAN.md and PROMPTS.md before making changes.
- Preserve the current architecture, types, interfaces and acceptance criteria.
- Do not recreate the project or replace the existing test suite.
- Do not modify tests simply to make them pass.
- Implement the actual functionality, not placeholder or fake implementations.
- Append this exact prompt to PROMPTS.md under the next numbered prompt entry. Preserve all existing prompt history.

IMPLEMENT THESE MODULES:

1. src/services/validation.ts
Implement validatePassengerForm according to the existing tests and domain types.
Validate full name, email, membership number, tier, status and points.
Reject empty, malformed, negative, fractional and invalid values as appropriate.
Detect duplicate membership numbers case-insensitively, while allowing the current record's own number during edits.
Return the exact validation result structure expected by existing tests.

2. src/services/sanitizer.ts
Implement sanitizeInput and sanitizePassengerData using the installed DOMPurify dependency where appropriate.
Neutralize script injection, inline event-handler payloads and javascript: URLs.
Preserve legitimate names containing apostrophes, hyphens and accented characters.
Trim whitespace and sanitize passenger data recursively as required by the existing tests.
Ensure user-provided text is rendered as text, never as executable HTML.

3. src/services/storage.ts
Implement the existing StorageService interface using localStorage.
Use the existing storage key frequent_flyer_passengers.
Handle corrupt JSON, unavailable browser storage, SecurityError and QuotaExceededError without crashing.
Provide an in-memory fallback when persistence is unavailable and implement isUsingFallback() accurately.
Do not claim that in-memory fallback data survives a page reload.
Handle storage failures explicitly and consistently.

4. src/services/passengerService.ts
Implement passenger CRUD, retrieval by ID, search, filtering, membership-number uniqueness and summary statistics.
Generate unique record IDs and timestamps.
Validate and sanitize records before saving.
Reject invalid records, duplicate membership numbers and updates to nonexistent IDs.
Ensure edits preserve the correct record identity and search works case-insensitively.
Persist successful mutations using the existing StorageService contract.
Do not lose unrelated records during an update or deletion.

5. src/services/analytics.ts
Implement trackUserInteraction using the existing analytics interface.
Use the exact required console message:
[Analytics] User interacted with End-to-End Frequent Flyer Portal
Support the existing primary action types and action metadata.
Only emit successful-action telemetry when the operation actually succeeds. Do not log sensitive passenger data.

TESTING AND QUALITY GATES:
- Run npm test and report exact results.
- Run npm run lint and ensure zero warnings and errors.
- Run npx tsc --noEmit if supported by the existing TypeScript configuration.
- Fix implementation defects without weakening the tests.
- Do not claim the entire application is complete; UI components are intentionally outside this phase.
- Do not add new unnecessary dependencies.
- Do not commit, push, or deploy.

At the end, report which tests pass or fail, the actual command outputs, files changed and any unresolved failures. Stop and wait for my next instruction.
```

## Prompt 3

```text
Continue the existing Frequent Flyer Portal project. Phase 1 core business logic is complete.

Implement PHASE 2: RESPONSIVE UI COMPONENTS AND INTEGRATION.

MANDATORY FIRST STEPS:
1. Inspect the existing application, services, domain types, test files, package.json, TEST_PLAN.md and PROMPTS.md.
2. Reuse the existing PassengerService, StorageService, validation, sanitizer and analytics implementations. Do not duplicate business logic.
3. Append this exact prompt verbatim to PROMPTS.md as the next numbered prompt.
4. Preserve all existing tests. Do not weaken, skip or delete tests to hide failures.

DESIGN:
Build a professional, enterprise-grade airline Frequent Flyer Portal with a clean monochromatic corporate design system.
Use white and neutral gray surfaces, subtle borders, consistent 16px/32px spacing, restrained shadows, readable typography and Lucide icons already installed.
Do not introduce arbitrary hex colors.
Make the interface fully responsive for desktop, tablet and mobile.
Use accessible semantic HTML and keyboard-friendly interactions.

IMPLEMENT THESE COMPONENTS:

1. Dashboard.tsx
- Main application layout and page heading.
- Passenger summary section.
- Search and filter controls.
- Passenger table.
- Add passenger action.
- Loading, error, offline and empty states.
- Refresh/retry behavior where applicable.

2. PassengerSummary.tsx
- Display total passengers, active members, suspended/inactive members and total points using existing summary data.
- Handle zero values and missing data gracefully.

3. PassengerTable.tsx
- Display passenger name, email, membership number, tier, points, status and actions.
- Implement Edit and Delete actions.
- Support search results and filtered data.
- Show "No data found" when no matching records exist.
- Use semantic table markup on larger screens and a usable responsive layout on smaller screens.
- Include accessible action labels.

4. PassengerFormModal.tsx
- Implement Add and Edit forms using existing domain types and validation.
- Fields: full name, email, membership number, tier, points and status.
- Show inline validation errors and red error styling for invalid fields.
- Use aria-invalid and connect errors to fields.
- Support keyboard navigation, Escape to close, sensible focus handling and dialog ARIA attributes.
- Prevent duplicate submissions.
- Preserve existing data when editing.

5. EmptyState.tsx
- Accessible, friendly empty state for an empty passenger list and empty search results.
- Provide a relevant action to add a passenger when appropriate.

6. LoadingIndicator.tsx
- Accessible loading indicator with role="status", an appropriate label and aria-busy="true".

7. ErrorBanner.tsx
- Accessible error message with role="alert".
- Clearly indicate offline status when appropriate.
- Provide a working Retry button when retry is available.

FUNCTIONAL INTEGRATION:
- Connect every component to the existing passenger service.
- Implement Create, Read, Update, Delete, search and tier/status filtering.
- Update summary statistics immediately after successful mutations.
- Add a confirmation dialog before deletion.
- Emit analytics only after successful primary actions using the existing analytics service.
- Never log passenger PII.
- Prevent unsafe HTML rendering and preserve the existing XSS protections.
- Handle async loading, failures, offline conditions, storage errors and retry without crashing.
- Do not imply that localStorage provides shared multi-user or server-side persistence.
- Avoid unnecessary API calls and dependencies.
- Ensure all buttons and inputs work with keyboard and mouse.

ACCESSIBILITY:
- Provide associated labels for all form fields.
- Use semantic headings, table headers and appropriate ARIA attributes.
- Ensure visible focus indicators, logical keyboard navigation and sufficient contrast.
- Respect reduced-motion preferences.
- Avoid unlabeled icon-only controls.

TEST-DRIVEN REQUIREMENTS:
- First inspect the existing 20 failing UI-related tests.
- Implement components and integration to satisfy the existing tests without changing their expectations.
- Run npm test, npm run lint and npx tsc --noEmit.
- Fix genuine defects and resolve all existing UI-related failures.
- Add tests for important edge cases if coverage is missing.
- If any requirement conflicts with the existing interface contracts, explain the conflict instead of silently weakening tests.

At completion, report the exact test counts, lint and TypeScript results, changed files, remaining defects and the actual command outputs. Do not claim success without verification. Stop after Phase 2 and wait for my next instruction.
```

## Prompt 4

```text
Continue the existing Frequent Flyer Portal project in the current workspace.

PHASE 3: BROWSER VERIFICATION, EDGE-CASE AUDIT AND ACCESSIBILITY REVIEW.

CURRENT BASELINE REPORTED:
- 71/71 Vitest tests passed.
- ESLint: zero warnings and errors.
- TypeScript check passed.
- Production build passed.
These are reported results; rerun checks when necessary and verify actual behavior.

FIRST:
1. Inspect the actual implementation, package.json, tests, TEST_PLAN.md and PROMPTS.md.
2. Append this exact prompt verbatim to PROMPTS.md as the next numbered entry.
3. Preserve all previous prompt history.
4. Do not commit, push or deploy.

TASK A — RUN AND INSPECT THE APPLICATION
- Start the existing Vite development server using npm run dev if it is not already running.
- Open the actual local application in the available browser preview.
- Inspect the dashboard at desktop, tablet and mobile viewport sizes.
- Look for broken layouts, horizontal overflow, clipped buttons, overlapping content, unreadable text and console errors.
- If browser access is unavailable, state that limitation honestly and provide the exact manual steps instead.

TASK B — MANUALLY VERIFY THE COMPLETE USER JOURNEY
Test each scenario against the actual running application:
1. Initial dashboard load and empty state.
2. Add a valid passenger and verify the new row and summary.
3. Submit a form with missing fields.
4. Submit an invalid email and a duplicate membership number.
5. Edit an existing passenger and confirm unrelated records remain unchanged.
6. Delete a passenger and verify the confirmation behavior.
7. Search by passenger name, email and membership number.
8. Apply tier and status filters, including a combination of search and filters.
9. Clear search and filters.
10. Test zero records and zero search matches.
11. Reload the page and verify persistence.
12. Test browser offline/online transitions, storage errors and retry behavior where reproducible.
13. Verify no action causes an uncaught exception or an unhandled promise rejection.
14. Confirm the exact required analytics message appears after successful primary actions and no passenger PII is logged.

TASK C — ACCESSIBILITY AUDIT
- Verify associated labels, semantic headings, table headers and dialog semantics.
- Test keyboard-only navigation, visible focus, Enter/Space activation, Escape dismissal and sensible focus restoration.
- Check form error announcements and aria-invalid behavior.
- Check contrast and reduced-motion handling.
- Run an automated accessibility audit using available tools, such as axe-core if already installed.
- Do not install unnecessary dependencies without justification.
- Report each issue with severity, reproduction steps and affected component.
- Aim for a 100% Lighthouse accessibility score as required by the TRD, but report the actual measured score. Never fabricate a Lighthouse result.

TASK D — LIGHTHOUSE AND PERFORMANCE
- Run Lighthouse against the actual running application if tooling is available.
- Record Performance, Accessibility, Best Practices and SEO scores.
- Investigate any score below 90.
- If Lighthouse is unavailable, provide the exact steps to run it through Chrome DevTools.
- Distinguish a measured score from an estimate.

TASK E — FIX AND REVERIFY
- Fix genuine defects found during the audit.
- Do not weaken or delete meaningful tests.
- Add regression tests for reproducible bugs.
- Re-run npm test, npm run lint, npx tsc --noEmit and npm run build.
- Report exact results and any remaining unverified scenarios.

Do not commit, push, or deploy. Do not claim that manual testing, Lighthouse or offline tests were completed unless they were actually performed.

Stop after Phase 3 and report the audit results, fixes and remaining issues.
```

## Prompt 5

```text
Continue the existing Frequent Flyer Portal project. Phase 3 browser verification is reported complete.

PHASE 4: PRODUCTION READINESS AND RELEASE AUDIT.

IMPORTANT:
- Work in the existing project directory.
- Read the existing package.json, source files, tests, TEST_PLAN.md, README.md and PROMPTS.md.
- Append this exact prompt verbatim to PROMPTS.md as the next numbered prompt.
- Preserve all previous prompt history.
- Do not commit, push, or deploy yet.
- Do not fabricate audit results or scores.

TASK 1 — PRODUCTION BUILD
Run and verify:
1. npm test
2. npx playwright test
3. npm run lint
4. npx tsc --noEmit
5. npm run build

Capture actual command exit codes and test counts. Fix genuine regressions without weakening tests.

TASK 2 — PRODUCTION PREVIEW
- Start the production preview using the existing Vite preview script.
- Verify the built application loads in Chrome.
- Test adding, editing, searching and deleting passenger records.
- Verify persistence across reloads, form validation and empty states.
- Inspect the browser console for uncaught errors.
- Test desktop and mobile layouts against the production build, not only the development server.
- Stop any preview process you start when it is no longer needed, unless the user needs it for further verification.

TASK 3 — FORMAL LIGHTHOUSE AUDIT
The previous report did not measure formal Lighthouse scores. Do not report estimated scores as measured results.

- Check whether Lighthouse CLI or an equivalent audit tool is already available.
- If available, audit the production preview URL.
- If not available, explain the exact command or Chrome DevTools steps required to run a formal audit. Do not install packages globally or add permanent project dependencies without justification.
- Measure Performance, Accessibility, Best Practices and SEO for desktop and mobile where supported.
- Aim for scores above 90 in every category and 100 for Accessibility, as required by the project brief.
- Save reports as HTML or JSON in a clearly named audit-results directory only if the tool supports it.
- Investigate real issues, fix them and rerun the relevant audits.
- Clearly distinguish measured scores from audits that could not be run.

TASK 4 — SECURITY AND SUBMISSION AUDIT
- Verify that .gitignore excludes node_modules, dist where appropriate, .env files, local credentials and generated secrets.
- Search tracked project files for API keys, tokens, passwords or sensitive personal data. Do not print secret values into the report.
- Verify that PROMPTS.md contains the actual prompt history and TEST_PLAN.md accurately reflects the executed tests.
- Confirm README.md contains setup, development, testing and production build instructions.
- Confirm the app clearly documents that its current data persistence is browser-local and does not provide shared multi-user storage.
- Check for unnecessary dependencies, console errors and obvious security defects.
- Do not claim that a localStorage-only application provides server-side security or cross-device synchronization.

TASK 5 — FINAL RELEASE GATES
Run the relevant checks again after any fixes:
- npm test
- npx playwright test
- npm run lint
- npx tsc --noEmit
- npm run build

Report actual results, remaining defects, Lighthouse scores, modified files and any manual checks that still require my action.

Do not commit, push, or deploy. Stop and wait for my next instruction.
```



