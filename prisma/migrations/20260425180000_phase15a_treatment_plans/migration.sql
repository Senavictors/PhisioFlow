-- Rename existing TherapyArea enum to legacy so we can recreate it with new values
ALTER TYPE "TherapyArea" RENAME TO "TherapyAreaLegacy";

-- CreateEnum
CREATE TYPE "TherapyArea" AS ENUM (
  'ORTOPEDICA',
  'NEUROLOGICA',
  'CARDIORESPIRATORIA',
  'ESTETICA',
  'ESPORTIVA',
  'PELVICA',
  'PEDIATRICA',
  'GERIATRICA',
  'PREVENTIVA',
  'OUTRA'
);

-- CreateEnum
CREATE TYPE "Specialty" AS ENUM (
  'PILATES',
  'RPG',
  'ACUPUNTURA',
  'LIBERACAO_MIOFASCIAL',
  'VENTOSATERAPIA',
  'DRY_NEEDLING',
  'TERAPIA_MANUAL',
  'OUTRA'
);

-- CreateEnum
CREATE TYPE "PricingModel" AS ENUM ('PER_SESSION', 'PACKAGE');

-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELED', 'PAUSED');

-- CreateTable
CREATE TABLE "TreatmentPlan" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "patientId" TEXT NOT NULL,
  "workplaceId" TEXT NOT NULL,
  "area" "TherapyArea" NOT NULL,
  "specialties" "Specialty"[] DEFAULT ARRAY[]::"Specialty"[],
  "attendanceType" "AttendanceType" NOT NULL,
  "pricingModel" "PricingModel" NOT NULL DEFAULT 'PER_SESSION',
  "status" "PlanStatus" NOT NULL DEFAULT 'ACTIVE',
  "sessionPrice" DECIMAL(10,2),
  "totalSessions" INTEGER,
  "packageAmount" DECIMAL(10,2),
  "startsAt" TIMESTAMP(3),
  "endsAt" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "TreatmentPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TreatmentPlan_userId_idx" ON "TreatmentPlan"("userId");
CREATE INDEX "TreatmentPlan_userId_patientId_idx" ON "TreatmentPlan"("userId", "patientId");
CREATE INDEX "TreatmentPlan_userId_status_idx" ON "TreatmentPlan"("userId", "status");
CREATE INDEX "TreatmentPlan_userId_patientId_status_idx" ON "TreatmentPlan"("userId", "patientId", "status");

-- AddForeignKey
ALTER TABLE "TreatmentPlan" ADD CONSTRAINT "TreatmentPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TreatmentPlan" ADD CONSTRAINT "TreatmentPlan_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TreatmentPlan" ADD CONSTRAINT "TreatmentPlan_workplaceId_fkey" FOREIGN KEY ("workplaceId") REFERENCES "Workplace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable: add Session.treatmentPlanId (nullable for now)
ALTER TABLE "Session" ADD COLUMN "treatmentPlanId" TEXT;

-- CreateIndex
CREATE INDEX "Session_userId_treatmentPlanId_idx" ON "Session"("userId", "treatmentPlanId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_treatmentPlanId_fkey" FOREIGN KEY ("treatmentPlanId") REFERENCES "TreatmentPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill: ensure every active user has a default workplace (already created in phase14, but be defensive)
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

-- Backfill: ensure every existing session has workplaceId and attendanceType (defensive)
UPDATE "Session" s
SET
  "workplaceId" = w.id,
  "attendanceType" = COALESCE(s."attendanceType", CASE s.type WHEN 'HOME_CARE'::"SessionType" THEN 'HOME_CARE'::"AttendanceType" ELSE 'CLINIC'::"AttendanceType" END)
FROM (
  SELECT DISTINCT ON ("userId") id, "userId"
  FROM "Workplace"
  WHERE "isActive" = true
  ORDER BY "userId", "createdAt" ASC
) w
WHERE w."userId" = s."userId"
  AND s."workplaceId" IS NULL;

UPDATE "Session" s
SET "attendanceType" = CASE s.type WHEN 'HOME_CARE'::"SessionType" THEN 'HOME_CARE'::"AttendanceType" ELSE 'CLINIC'::"AttendanceType" END
WHERE s."attendanceType" IS NULL;

-- Backfill: create one legacy TreatmentPlan per active patient that has at least one session
WITH patient_default AS (
  SELECT
    p.id AS patient_id,
    p."userId" AS user_id,
    p.area::text AS old_area,
    (
      SELECT w.id
      FROM "Workplace" w
      WHERE w."userId" = p."userId" AND w."isActive" = true
      ORDER BY w."createdAt" ASC
      LIMIT 1
    ) AS workplace_id,
    COALESCE(
      (
        SELECT s."attendanceType"
        FROM "Session" s
        WHERE s."patientId" = p.id AND s."attendanceType" IS NOT NULL
        GROUP BY s."attendanceType"
        ORDER BY COUNT(*) DESC
        LIMIT 1
      ),
      CASE WHEN p.area::text = 'HOME_CARE' THEN 'HOME_CARE'::"AttendanceType" ELSE 'CLINIC'::"AttendanceType" END
    ) AS attendance_type
  FROM "Patient" p
  WHERE p."isActive" = true
    AND EXISTS (SELECT 1 FROM "Session" s WHERE s."patientId" = p.id)
    AND NOT EXISTS (SELECT 1 FROM "TreatmentPlan" tp WHERE tp."patientId" = p.id)
)
INSERT INTO "TreatmentPlan" (
  id, "userId", "patientId", "workplaceId", area, specialties,
  "attendanceType", "pricingModel", status, notes, "createdAt", "updatedAt"
)
SELECT
  gen_random_uuid()::text,
  pd.user_id,
  pd.patient_id,
  pd.workplace_id,
  CASE pd.old_area
    WHEN 'AESTHETIC' THEN 'ESTETICA'::"TherapyArea"
    ELSE 'ORTOPEDICA'::"TherapyArea"
  END,
  CASE pd.old_area
    WHEN 'PILATES' THEN ARRAY['PILATES']::"Specialty"[]
    ELSE ARRAY[]::"Specialty"[]
  END,
  pd.attendance_type,
  'PER_SESSION'::"PricingModel",
  'ACTIVE'::"PlanStatus",
  'Plano legado migrado de v14',
  now(),
  now()
FROM patient_default pd
WHERE pd.workplace_id IS NOT NULL;

-- Link existing sessions to their patient's legacy plan
UPDATE "Session" s
SET "treatmentPlanId" = tp.id
FROM "TreatmentPlan" tp
WHERE tp."patientId" = s."patientId"
  AND tp.notes = 'Plano legado migrado de v14'
  AND s."treatmentPlanId" IS NULL;
