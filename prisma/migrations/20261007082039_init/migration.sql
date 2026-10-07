-- CreateTable
CREATE TABLE "system_info" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "system_info_pkey" PRIMARY KEY ("key")
);
