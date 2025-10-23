-- CreateTable
CREATE TABLE "FastGenerationUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FastGenerationUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FastGenerationUsage_userId_idx" ON "FastGenerationUsage"("userId");

-- CreateIndex
CREATE INDEX "FastGenerationUsage_weekStart_idx" ON "FastGenerationUsage"("weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "FastGenerationUsage_userId_weekStart_key" ON "FastGenerationUsage"("userId", "weekStart");

-- AddForeignKey
ALTER TABLE "FastGenerationUsage" ADD CONSTRAINT "FastGenerationUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
