/*
  Warnings:

  - You are about to drop the column `cpu_core_count` on the `MonitoringData` table. All the data in the column will be lost.
  - You are about to drop the column `cpu_name` on the `MonitoringData` table. All the data in the column will be lost.
  - You are about to drop the column `disk_available` on the `MonitoringData` table. All the data in the column will be lost.
  - You are about to drop the column `disk_total` on the `MonitoringData` table. All the data in the column will be lost.
  - You are about to drop the column `hostname` on the `MonitoringData` table. All the data in the column will be lost.
  - You are about to drop the column `os_name` on the `MonitoringData` table. All the data in the column will be lost.
  - You are about to drop the column `os_version` on the `MonitoringData` table. All the data in the column will be lost.
  - You are about to drop the column `public_ip` on the `MonitoringData` table. All the data in the column will be lost.
  - You are about to drop the column `ram_available` on the `MonitoringData` table. All the data in the column will be lost.
  - You are about to drop the column `ram_total` on the `MonitoringData` table. All the data in the column will be lost.
  - You are about to drop the column `swap_available` on the `MonitoringData` table. All the data in the column will be lost.
  - You are about to drop the column `swap_total` on the `MonitoringData` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MonitoringData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "CONTAINER_OS_NAME" TEXT,
    "CONTAINER_OS_ID" TEXT,
    "CONTAINER_OS_ID_LIKE" TEXT,
    "CONTAINER_OS_VERSION" TEXT,
    "CONTAINER_OS_VERSION_ID" TEXT,
    "CONTAINER_OS_DETECTION" TEXT,
    "CONTAINER_IS_OFFICIAL_IMAGE" TEXT,
    "HOST_NAME" TEXT,
    "HOST_OS_NAME" TEXT,
    "HOST_OS_ID" TEXT,
    "HOST_OS_ID_LIKE" TEXT,
    "HOST_OS_VERSION" TEXT,
    "HOST_OS_VERSION_ID" TEXT,
    "HOST_OS_DETECTION" TEXT,
    "HOST_IS_K8S_NODE" TEXT,
    "SYSTEM_KERNEL_NAME" TEXT,
    "SYSTEM_KERNEL_VERSION" TEXT,
    "SYSTEM_ARCHITECTURE" TEXT,
    "SYSTEM_VIRTUALIZATION" TEXT,
    "SYSTEM_VIRT_DETECTION" TEXT,
    "SYSTEM_CONTAINER" TEXT,
    "SYSTEM_CONTAINER_DETECTION" TEXT,
    "SYSTEM_CPU_LOGICAL_CPU_COUNT" TEXT,
    "SYSTEM_CPU_VENDOR" TEXT,
    "SYSTEM_CPU_MODEL" TEXT,
    "SYSTEM_CPU_FREQ" TEXT,
    "SYSTEM_CPU_DETECTIO" TEXT,
    "SYSTEM_TOTAL_RAM" TEXT,
    "SYSTEM_FREE_RAM" TEXT,
    "SYSTEM_TOTAL_SWAP" TEXT,
    "SYSTEM_FREE_SWAP" TEXT,
    "SYSTEM_RAM_DETECTION" TEXT,
    "SYSTEM_TOTAL_DISK_SIZE" TEXT,
    "SYSTEM_DISK_DETECTION" TEXT,
    "INSTANCE_CLOUD_TYPE" TEXT,
    "INSTANCE_CLOUD_INSTANCE_TYPE" TEXT,
    "INSTANCE_CLOUD_INSTANCE_REGION" TEXT,
    "DISK_USED" TEXT,
    "DISK_AVAIL" TEXT,
    "HOST_PUBLIC_IP" TEXT
);
INSERT INTO "new_MonitoringData" ("createdAt", "id", "updatedAt") SELECT "createdAt", "id", "updatedAt" FROM "MonitoringData";
DROP TABLE "MonitoringData";
ALTER TABLE "new_MonitoringData" RENAME TO "MonitoringData";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
