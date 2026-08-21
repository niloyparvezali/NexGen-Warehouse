# NexGen Warehouse — Responsive Rebuild Notes

This update preserves the existing desktop experience and adds a dedicated responsive presentation layer for tablet/mobile breakpoints.

## Responsive behavior added
- Mobile navigation drawer/backdrop state is now explicit; the closed drawer cannot block page interaction.
- Mobile/tablet header controls are reflowed to prevent overlap.
- Master-data and transactional list tables switch to labeled card rows on narrow screens where a full table is not appropriate.
- Customer, supplier, product, purchase, expense, and master-data lists keep all row information accessible without clipped columns.
- Users/Roles list tables use the same mobile card pattern while the Roles permission matrix remains horizontally scrollable because it is genuinely tabular.
- Customer/Supplier ledgers and report datasets retain bounded horizontal scrolling for dense financial/tabular information.
- POS is reorganized into a vertical mobile workflow with touch-sized controls and an accessible totals/checkout region.
- Forms, filters, tabs, pagination, loading/empty states, and dialogs receive mobile/tablet-specific sizing and wrapping.
- Short-height screens receive reduced vertical chrome.

## Desktop protection
All new structural rules are isolated below the tablet/mobile breakpoints. No desktop component is replaced by the responsive layer.

## Verification note
The uploaded sandbox did not contain a working Vite executable, and dependency installation could not complete in the available environment, so a production Vite build could not be executed here. Source/CSS structure was statically checked and the project is packaged without the incomplete sandbox `node_modules` directory.
