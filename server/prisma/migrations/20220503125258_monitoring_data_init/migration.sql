-- CreateTable
CREATE TABLE "MonitoringData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "hostname" TEXT,
    "public_ip" TEXT,
    "os_name" TEXT,
    "os_version" TEXT,
    "cpu_name" TEXT,
    "cpu_core_count" INTEGER,
    "ram_total" BIGINT,
    "ram_available" BIGINT,
    "swap_total" BIGINT,
    "swap_available" BIGINT,
    "disk_total" BIGINT,
    "disk_available" BIGINT
);
