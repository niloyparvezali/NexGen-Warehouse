-- Sync production columns with the current Prisma schema.
-- Idempotent column additions for the production database.

ALTER TABLE "Customer"
  ADD COLUMN IF NOT EXISTS "city" TEXT,
  ADD COLUMN IF NOT EXISTS "currentBalance" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "customerType" "CustomerType" NOT NULL DEFAULT 'RETAIL',
  ADD COLUMN IF NOT EXISTS "notes" TEXT,
  ADD COLUMN IF NOT EXISTS "previousDue" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "status" "CustomerStatus" NOT NULL DEFAULT 'ACTIVE';

ALTER TABLE "Purchase"
  ADD COLUMN IF NOT EXISTS "invoiceNumber" TEXT,
  ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "referenceNumber" TEXT,
  ADD COLUMN IF NOT EXISTS "shippingCost" DECIMAL(10,2) NOT NULL DEFAULT 0;
