# NexGen World-Class UI/UX Update

This update establishes a safer product-level UI foundation without replacing the existing ERP/POS business workflows.

## Included
- True dark/light theme tokens and working theme switching.
- Cleaner SaaS application shell and page canvas.
- More compact, accessible header controls.
- Consistent focus-visible states.
- More restrained shadows and motion.
- Improved form control focus/disabled/placeholder states.
- Improved table readability and focus feedback.
- Responsive spacing refinements.
- Reduced-motion support.
- Existing navigation, routes, business logic, and data flows preserved.

## Intentionally not changed
- Database schema.
- Authentication and permission model.
- ERP/POS transaction rules.
- Existing routes.
- Existing API/service contracts.
- Existing module information architecture.

## QA note
Run `npm run build` and `npm run lint` from `client/` after installing dependencies. Manual QA should cover POS checkout, CRUD flows, permissions, theme switching, and responsive breakpoints.


## Sales workspace rebuild

The Sales/POS workspace was rebuilt after visual review of the supplied item-form screenshot. The item editor now separates core line-item data from optional warranty/serial details, while checkout is isolated into a dedicated summary panel. See `SALES_WORLD_CLASS_REBUILD.md` for the detailed change record.
