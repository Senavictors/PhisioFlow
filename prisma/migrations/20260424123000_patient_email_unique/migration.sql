-- CreateIndex
CREATE UNIQUE INDEX "Patient_userId_email_key" ON "Patient"("userId", "email");
