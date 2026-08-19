-- Create dynamic expense categories and migrate the legacy enum-based expense category.
CREATE TABLE "ExpenseCategory" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ExpenseCategory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ExpenseCategory_name_key" ON "ExpenseCategory"("name");

INSERT INTO "ExpenseCategory" ("id","name","description","isActive","createdAt","updatedAt")
VALUES
  (substr(md5(random()::text || clock_timestamp()::text),1,25), 'RENT', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (substr(md5(random()::text || clock_timestamp()::text),1,25), 'SALARY', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (substr(md5(random()::text || clock_timestamp()::text),1,25), 'ELECTRICITY', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (substr(md5(random()::text || clock_timestamp()::text),1,25), 'INTERNET', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (substr(md5(random()::text || clock_timestamp()::text),1,25), 'TRANSPORT', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (substr(md5(random()::text || clock_timestamp()::text),1,25), 'OFFICE_SUPPLIES', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (substr(md5(random()::text || clock_timestamp()::text),1,25), 'MAINTENANCE', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (substr(md5(random()::text || clock_timestamp()::text),1,25), 'MARKETING', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (substr(md5(random()::text || clock_timestamp()::text),1,25), 'MISCELLANEOUS', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

ALTER TABLE "Expense" ADD COLUMN "categoryId" TEXT;
ALTER TABLE "Expense" ADD COLUMN "referenceNumber" TEXT;
ALTER TABLE "Expense" ADD COLUMN "attachment" TEXT;

UPDATE "Expense" e
SET "categoryId" = c."id"
FROM "ExpenseCategory" c
WHERE c."name" = e."category"::text;

ALTER TABLE "Expense" ALTER COLUMN "categoryId" SET NOT NULL;
ALTER TABLE "Expense" DROP COLUMN "category";
DROP TYPE IF EXISTS "ExpenseCategory";

ALTER TABLE "Expense"
  ADD CONSTRAINT "Expense_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "ExpenseCategory"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
