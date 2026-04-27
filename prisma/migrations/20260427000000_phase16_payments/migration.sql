-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM (
  'PIX',
  'CASH',
  'CREDIT_CARD',
  'DEBIT_CARD',
  'BANK_TRANSFER',
  'INSURANCE',
  'OTHER'
);

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PAID', 'PENDING', 'PARTIAL', 'REFUNDED');

-- AlterTable: add expectedFee and paymentStatus to Session
ALTER TABLE "Session"
  ADD COLUMN "expectedFee" DECIMAL(10, 2),
  ADD COLUMN "paymentStatus" "PaymentStatus";

-- CreateTable
CREATE TABLE "Payment" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "treatmentPlanId" TEXT,
  "sessionId" TEXT,
  "amount" DECIMAL(10, 2) NOT NULL,
  "method" "PaymentMethod" NOT NULL,
  "status" "PaymentStatus" NOT NULL DEFAULT 'PAID',
  "paidAt" TIMESTAMP(3) NOT NULL,
  "dueAt" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");
CREATE INDEX "Payment_userId_paidAt_idx" ON "Payment"("userId", "paidAt");
CREATE INDEX "Payment_userId_treatmentPlanId_idx" ON "Payment"("userId", "treatmentPlanId");
CREATE INDEX "Payment_userId_sessionId_idx" ON "Payment"("userId", "sessionId");
CREATE INDEX "Payment_userId_status_dueAt_idx" ON "Payment"("userId", "status", "dueAt");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_treatmentPlanId_fkey" FOREIGN KEY ("treatmentPlanId") REFERENCES "TreatmentPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- XOR constraint: exactly one of treatmentPlanId / sessionId must be set
ALTER TABLE "Payment" ADD CONSTRAINT "payment_target_xor"
  CHECK (
    ("treatmentPlanId" IS NOT NULL AND "sessionId" IS NULL)
    OR
    ("treatmentPlanId" IS NULL AND "sessionId" IS NOT NULL)
  );

-- Backfill: snapshot expectedFee on existing Sessions
-- PER_SESSION plan -> plan.sessionPrice
UPDATE "Session" s
SET "expectedFee" = tp."sessionPrice"
FROM "TreatmentPlan" tp
WHERE s."treatmentPlanId" = tp.id
  AND tp."pricingModel" = 'PER_SESSION'
  AND tp."sessionPrice" IS NOT NULL
  AND s."expectedFee" IS NULL;

-- Avulsa (sem plano) -> default do workplace
UPDATE "Session" s
SET "expectedFee" = w."defaultSessionPrice"
FROM "Workplace" w
WHERE s."workplaceId" = w.id
  AND s."treatmentPlanId" IS NULL
  AND w."defaultSessionPrice" IS NOT NULL
  AND s."expectedFee" IS NULL;

-- Initialize Session.paymentStatus = PENDING para sessões com expectedFee > 0
UPDATE "Session"
SET "paymentStatus" = 'PENDING'
WHERE "expectedFee" IS NOT NULL
  AND "expectedFee" > 0
  AND "paymentStatus" IS NULL;
