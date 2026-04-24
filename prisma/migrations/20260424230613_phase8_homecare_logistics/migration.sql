-- CreateEnum
CREATE TYPE "HomeCarePriority" AS ENUM ('NORMAL', 'HIGH', 'URGENT');

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "address" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "homeCareNotes" TEXT,
ADD COLUMN     "homeCarePriority" "HomeCarePriority" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "neighborhood" TEXT;
