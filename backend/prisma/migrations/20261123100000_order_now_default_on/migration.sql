-- Buy Now button on by default; enable for all existing products
ALTER TABLE "Product" ALTER COLUMN "orderNow" SET DEFAULT true;
UPDATE "Product" SET "orderNow" = true;
