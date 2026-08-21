NexGen Warehouse deployment fix

Problem fixed:
- PostgreSQL migration 20260819150000_fix_expense_category_model failed because the legacy ExpenseCategory enum and the new ExpenseCategory table used the same PostgreSQL name.
- Prisma schema and expense services were inconsistent with the intended ExpenseCategory table model.

Files changed:
- server/prisma/schema.prisma
- server/prisma/migrations/20260819150000_fix_expense_category_model/migration.sql
- server/src/services/expense.service.js
- server/src/services/report.service.js
- server/src/services/dashboard.service.js
- server/src/validations/expense.validation.js

Deployment:
1. Replace the corresponding files in your local NexGen-Warehouse repository.
2. Commit and push to main.
3. Render should redeploy automatically.
4. Keep the Render build command with prisma migrate deploy and prisma db seed for the initial database bootstrap.
5. Once the database is initialized, remove db seed from the normal production build command and keep only prisma migrate deploy.

Do not commit any .env files or secrets.
