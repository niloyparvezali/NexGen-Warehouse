# NexGen Navigation UX Fix

This update is intentionally limited to the sidebar/navigation architecture described in the supplied navigation UX specification.

## Root cause
Desktop navigation was using a full-screen backdrop whenever the sidebar was open. That backdrop sat above the application workspace, intercepted pointer events, and visually dimmed/blurred the main page. The desktop sidebar also used a toggle control inside the compact header area, which could cover the brand/icon zone when collapsed.

## Architecture fix
Desktop now uses a real flex layout: sidebar width is part of the layout and the main content automatically occupies the remaining space. The backdrop exists only in the mobile drawer breakpoint. The sidebar toggle is positioned on the sidebar edge and switches between `←` (collapse) and `→` (expand).

## Parent / child navigation
Parent groups use an explicit three-state behavior:
- no manual override: an active child automatically expands its parent;
- manual open: the parent stays open;
- manual closed: the parent stays closed even while its child page is active.

This means a child page can remain active without forcing the dropdown to stay open forever.

## Collapsed sidebar
Parent icons remain interactive in icon-only mode. Clicking or hovering a parent opens a fixed-position popout beside the sidebar. The popout is positioned from the actual icon bounding box so it does not cover the parent icon, and it closes on outside click or child selection.

Collapsed leaf items use native browser tooltips through the `title` attribute, while the current item retains a visible active indicator.

## Active route behavior
Child active state is derived from the current React Router pathname. Active child routes highlight the child and parent. Refreshing an active child route automatically expands its parent because the initial manual override is unset. Browser back/forward navigation updates the same route-derived active state.

## Verification
The client source was statically inspected after the navigation changes. A fresh `npm run lint` / `npm run build` could not be executed in this environment because the uploaded project does not contain a usable installed client dependency tree (`eslint` and `vite` binaries were unavailable after the install attempt).
