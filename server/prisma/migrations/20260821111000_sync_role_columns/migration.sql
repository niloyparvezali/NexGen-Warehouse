-- Sync Role columns required by the current Prisma schema.
ALTER TABLE "roles"
  ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "roles"
  ADD COLUMN IF NOT EXISTS "permissions" JSONB;
