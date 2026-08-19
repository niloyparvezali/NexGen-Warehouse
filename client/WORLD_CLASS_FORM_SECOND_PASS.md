# NexGen ERP/POS — World-Class Form & Workflow Second Pass

This pass focuses on making forms easier to read, understand, and complete without changing the existing API/data contracts.

## Rebuilt form experience
- Product: identity, classification, pricing/stock, warranty/notes sections.
- Customer: identity, account setup, notes.
- Supplier: identity, address, account status.
- Expense: expense details, reference/notes.
- Customer/Supplier payments: payment information and notes.
- Category, Brand, Unit, Expense Category: focused single-purpose sections.
- Inventory adjustment: cleaned operational form structure.
- Purchase: supplier/reference, product finding, totals/payment, document/notes are visually separated.

## UX principles
- One question group per section.
- Clear labels and descriptive helper text.
- Strong focus states.
- Error messaging is contextual and easy to scan.
- Primary action remains visible and consistent.
- Responsive grids collapse cleanly on smaller screens.
- Existing business logic and service calls are preserved.

## Verification note
A full dependency install/build could not be completed in the execution environment, so no claim of a successful production build is made here.
