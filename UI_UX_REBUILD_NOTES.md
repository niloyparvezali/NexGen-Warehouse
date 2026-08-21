# NexGen Warehouse — UI/UX Rebuild Notes

This build applies the supplied product-level UI/UX specification while keeping the existing API/service, authentication, permission, routing, and backend architecture as the foundation.

## Rebuilt foundations
- Premium NexGen enterprise visual language with centralized theme variables.
- Responsive application shell with permission-aware navigation and mobile drawer behavior.
- Branded global startup/loading screen.
- Rebuilt enterprise login screen with password visibility control and human-readable validation/auth errors.
- Shared form/input styling, focus states, and accessibility improvements.
- Modal keyboard escape, focus-on-open, backdrop close, and scroll locking.
- Header search wired to the existing command palette with Ctrl/Cmd+K support.
- User menu with account context, Settings entry, command search, and sign-out.
- Light/dark mode preserved through the existing theme architecture.
- Mobile-focused spacing and overflow behavior.
- Temporary frontend rebuild helper files removed from the shipped source tree.

## Preserved
- Existing React Router routes and protected/permission routes.
- Existing authentication service and stored session behavior.
- Existing API services and backend contracts.
- Existing inventory, POS/sales, purchasing, customers, suppliers, expenses, reports, user management, and settings modules.

## Verification note
The provided archive contained a Windows-style/incomplete `node_modules` directory. In this Linux execution environment the client `eslint` and Vite binaries were not available, and dependency installation could not complete. The project was therefore packaged from the edited source without claiming a successful `npm run lint` or `npm run build` in this environment.
