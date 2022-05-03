/*
  Warnings:

  - A unique constraint covering the columns `[secret]` on the table `MonitoringData` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "MonitoringData" ADD COLUMN "secret" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "MonitoringData_secret_key" ON "MonitoringData"("secret");
