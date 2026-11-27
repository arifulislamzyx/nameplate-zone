-- Steadfast courier tracking on orders
ALTER TABLE "Order" ADD COLUMN "courier" TEXT;
ALTER TABLE "Order" ADD COLUMN "consignmentId" TEXT;
ALTER TABLE "Order" ADD COLUMN "trackingCode" TEXT;
ALTER TABLE "Order" ADD COLUMN "courierStatus" TEXT;
ALTER TABLE "Order" ADD COLUMN "courierSentAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Order_consignmentId_key" ON "Order"("consignmentId");
