-- CreateEnum
CREATE TYPE "WorkplaceKind" AS ENUM ('OWN_CLINIC', 'PARTNER_CLINIC', 'PARTICULAR', 'ONLINE');

-- CreateEnum
CREATE TYPE "AttendanceType" AS ENUM ('CLINIC', 'HOME_CARE', 'HOSPITAL', 'CORPORATE', 'ONLINE');

-- DropForeignKey
ALTER TABLE "CalendarEventLink" DROP CONSTRAINT "CalendarEventLink_sessionId_fkey";

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "attendanceType" "AttendanceType",
ADD COLUMN     "workplaceId" TEXT;

-- CreateTable
CREATE TABLE "Workplace" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "WorkplaceKind" NOT NULL,
    "defaultAttendanceType" "AttendanceType" NOT NULL,
    "address" TEXT,
    "defaultSessionPrice" DECIMAL(10,2),
    "defaultCommissionPct" DECIMAL(5,2),
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workplace_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Workplace_userId_idx" ON "Workplace"("userId");

-- CreateIndex
CREATE INDEX "Workplace_userId_isActive_idx" ON "Workplace"("userId", "isActive");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_workplaceId_fkey" FOREIGN KEY ("workplaceId") REFERENCES "Workplace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workplace" ADD CONSTRAINT "Workplace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEventLink" ADD CONSTRAINT "CalendarEventLink_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Backfill: create default workplace for every existing user
INSERT INTO "Workplace" (id, "userId", name, kind, "defaultAttendanceType", "isActive", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  u.id,
  'Meu consultório',
  'OWN_CLINIC'::"WorkplaceKind",
  'CLINIC'::"AttendanceType",
  true,
  now(),
  now()
FROM "User" u
WHERE NOT EXISTS (
  SELECT 1 FROM "Workplace" w WHERE w."userId" = u.id
);

-- Backfill: link existing sessions to their user's default workplace and set attendanceType
UPDATE "Session" s
SET
  "workplaceId" = w.id,
  "attendanceType" = CASE s.type
    WHEN 'HOME_CARE'::"SessionType" THEN 'HOME_CARE'::"AttendanceType"
    ELSE 'CLINIC'::"AttendanceType"
  END
FROM (
  SELECT DISTINCT ON ("userId") id, "userId"
  FROM "Workplace"
  WHERE "isActive" = true
  ORDER BY "userId", "createdAt" ASC
) w
WHERE w."userId" = s."userId"
  AND s."workplaceId" IS NULL;
