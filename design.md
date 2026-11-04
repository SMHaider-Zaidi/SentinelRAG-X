# SentinelRAG-X — Initial UI Design Guide

## 1. Design objective

Create a clean, professional academic prototype that looks credible in a course demonstration. The interface should communicate document control, evidence, and traceability without resembling a complex enterprise dashboard.

Prioritize clarity and working interactions over visual effects. Fonts, colors, and spacing can be refined later without changing the application structure.

## 2. Visual direction

- **Style:** restrained, modern, minimal, trustworthy.
- **Layout:** light background, clear content panels, consistent spacing, simple navigation.
- **Typography:** readable system font stack initially (Inter if already available; otherwise system sans-serif). Do not spend time sourcing fonts.
- **Color:** neutral slate/gray foundation with one restrained blue or indigo accent.
- **Status colors:** green for ready/success, amber for processing/warning, red for failed/quarantined, gray for inactive.
- **Components:** simple buttons, inputs, cards, tables, badges, dialogs, and alerts.
- **Icons:** optional; use one consistent icon set only if convenient. Always retain clear text labels.

## 3. Application layout

### Public pages
- Login
- Register

Keep forms centered, compact, and easy to use. Show validation errors next to fields and a general message for server failures.

### Authenticated application shell
- Sidebar or compact top navigation.
- Product name: **SentinelRAG-X**.
- Navigation: Dashboard, Documents, Ask Questions.
- Admin-only navigation: Audit Log (if implemented).
- Show current user and logout action.
- Navigation should collapse cleanly on smaller screens.

### Dashboard
- Welcome heading.
- Small summary cards: accessible documents, ready documents, recent activity (only when real data exists).
- Primary action: upload document (admin) or ask a question (user).
- Do not invent metrics or add decorative charts without real data.

### Documents page
- Clear upload area for admins.
- List/table: document name, upload date, status, uploader (if available), actions.
- Status labels: processing, ready, failed, quarantined.
- Useful empty state.
- Admin-only controls for permissions and quarantine.
- Never expose inaccessible documents through the UI or API.

### Ask Questions page
This is the main demonstration screen:
- Clear title and short instruction: ask about documents you can access.
- Readable conversation area.
- Question input and send button.
- Loading indicator during retrieval/model generation.
- Answer displayed in a distinct but restrained panel.
- **Sources** section under each answer: document title, page where available, short excerpt.
- Explicit insufficient-evidence state.
- Explicit local AI unavailable state.
- If an evidence score/status is shown, explain that it is a heuristic, not a truth guarantee.
- Do not display raw embedding vectors.

### Audit page (optional)
- Simple table: time, actor, event, target, outcome/reason.
- Basic filters only if quick to implement.
- Admin only.

## 4. Reusable UI components

Build only what screens actually need:
- `AppLayout` / navigation
- `ProtectedRoute`
- `Button`
- `Input` / `FormField`
- `Card`
- `StatusBadge`
- `Alert`
- `LoadingState`
- `EmptyState`
- `SourceReference`
- `ConfirmDialog` for destructive/admin actions

Do not build a generic design system or component framework.

## 5. Interaction and accessibility basics

- Every button must perform a real action.
- Use visible input labels, not placeholders alone.
- Provide keyboard focus states and readable contrast.
- Disable submit while requests are in progress; prevent duplicate submissions.
- Confirm quarantine/restore actions and capture a reason.
- Show success and failure feedback after important operations.
- Keep forms usable on laptop screens and mobile widths.
- Do not rely on color alone for status; include text labels.

## 6. Page structure

```text
Login / Register
        |
Authenticated App
        |
        +-- Dashboard
        +-- Documents
        |     +-- Upload (admin)
        |     +-- Document list
        |     +-- Permission controls (admin)
        |     +-- Quarantine / restore (admin)
        |
        +-- Ask Questions
        |     +-- Conversation
        |     +-- Answer
        |     +-- Source references
        |
        +-- Audit Log (admin, optional)
```

## 7. Design boundaries

Do not spend the three-week schedule on:
- Complex animations or transitions.
- Multiple themes or customizable branding.
- Elaborate charts and analytics.
- Rich-text editing.
- Drag-and-drop polish beyond a basic file input.
- Pixel-perfect design before core flows work.

The UI is successful when a first-time viewer can sign in, upload a document, ask a question, inspect sources, and see permission/quarantine behaviour without a lengthy explanation.
