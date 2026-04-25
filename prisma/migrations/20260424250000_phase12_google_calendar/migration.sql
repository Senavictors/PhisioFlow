-- CreateEnum
CREATE TYPE "CalendarProvider" AS ENUM ('GOOGLE');

-- CreateEnum
CREATE TYPE "CalendarSyncStatus" AS ENUM ('SYNCED', 'FAILED', 'REMOVED');

-- CreateTable
CREATE TABLE "CalendarConnection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "CalendarProvider" NOT NULL DEFAULT 'GOOGLE',
    "accountEmail" TEXT NOT NULL,
    "encryptedRefreshToken" TEXT NOT NULL,
    "encryptedAccessToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "calendarId" TEXT,
    "calendarSummary" TEXT,
    "syncNewSessionsByDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarEventLink" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "provider" "CalendarProvider" NOT NULL DEFAULT 'GOOGLE',
    "externalEventId" TEXT NOT NULL,
    "calendarId" TEXT NOT NULL,
    "status" "CalendarSyncStatus" NOT NULL DEFAULT 'SYNCED',
    "errorMessage" TEXT,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarEventLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CalendarConnection_userId_provider_key" ON "CalendarConnection"("userId", "provider");

-- CreateIndex
CREATE INDEX "CalendarConnection_userId_idx" ON "CalendarConnection"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarEventLink_provider_externalEventId_key" ON "CalendarEventLink"("provider", "externalEventId");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarEventLink_sessionId_provider_key" ON "CalendarEventLink"("sessionId", "provider");

-- CreateIndex
CREATE INDEX "CalendarEventLink_userId_idx" ON "CalendarEventLink"("userId");

-- CreateIndex
CREATE INDEX "CalendarEventLink_userId_sessionId_idx" ON "CalendarEventLink"("userId", "sessionId");

-- AddForeignKey
ALTER TABLE "CalendarConnection" ADD CONSTRAINT "CalendarConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEventLink" ADD CONSTRAINT "CalendarEventLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEventLink" ADD CONSTRAINT "CalendarEventLink_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
