-- AlterTable
ALTER TABLE "Purchase"
ADD COLUMN "attachment" TEXT;

ALTER TABLE "Purchase"
ADD COLUMN "clientReferenceId" TEXT UNIQUE;
