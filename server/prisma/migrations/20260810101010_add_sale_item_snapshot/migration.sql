-- Add snapshot fields to sale items so each sold unit preserves the product name and SKU at sale time.
ALTER TABLE "SaleItem" ADD COLUMN "productName" TEXT;
ALTER TABLE "SaleItem" ADD COLUMN "productSku" TEXT;
