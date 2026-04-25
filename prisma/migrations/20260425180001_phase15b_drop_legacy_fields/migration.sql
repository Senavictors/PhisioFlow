-- Drop legacy Patient.area column (still typed as TherapyAreaLegacy after rename)
ALTER TABLE "Patient" DROP COLUMN "area";

-- Drop legacy enum
DROP TYPE "TherapyAreaLegacy";

-- Drop legacy Session.type column and its enum
ALTER TABLE "Session" DROP COLUMN "type";
DROP TYPE "SessionType";

-- Make workplaceId and attendanceType non-nullable on Session
ALTER TABLE "Session" ALTER COLUMN "workplaceId" SET NOT NULL;
ALTER TABLE "Session" ALTER COLUMN "attendanceType" SET NOT NULL;

-- Drop the old SET NULL FK from phase14 and re-add as RESTRICT (since now NOT NULL)
ALTER TABLE "Session" DROP CONSTRAINT "Session_workplaceId_fkey";
ALTER TABLE "Session" ADD CONSTRAINT "Session_workplaceId_fkey" FOREIGN KEY ("workplaceId") REFERENCES "Workplace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
