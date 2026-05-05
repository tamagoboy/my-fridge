-- CreateTable
CREATE TABLE "StorageLocation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "fridgeId" TEXT NOT NULL,

    CONSTRAINT "StorageLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InputHistory" (
    "id" TEXT NOT NULL,
    "fridgeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "count" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "InputHistory_pkey" PRIMARY KEY ("id")
);

-- Alter Food table: drop old columns, add new columns
ALTER TABLE "Food" DROP COLUMN IF EXISTS "quantity";
ALTER TABLE "Food" DROP COLUMN IF EXISTS "unit";
ALTER TABLE "Food" DROP COLUMN IF EXISTS "storageLocation";
ALTER TABLE "Food" ADD COLUMN IF NOT EXISTS "remainingStatus" TEXT NOT NULL DEFAULT 'full';
ALTER TABLE "Food" ADD COLUMN IF NOT EXISTS "storageLocationId" TEXT;
ALTER TABLE "Food" ADD COLUMN IF NOT EXISTS "expiryDate" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "StorageLocation_fridgeId_name_key" ON "StorageLocation"("fridgeId", "name");
CREATE INDEX "StorageLocation_fridgeId_idx" ON "StorageLocation"("fridgeId");

-- CreateIndex
CREATE UNIQUE INDEX "InputHistory_fridgeId_name_key" ON "InputHistory"("fridgeId", "name");
CREATE INDEX "InputHistory_fridgeId_idx" ON "InputHistory"("fridgeId");

-- CreateIndex
CREATE INDEX "Food_fridgeId_storageLocationId_idx" ON "Food"("fridgeId", "storageLocationId");

-- AddForeignKey
ALTER TABLE "StorageLocation" ADD CONSTRAINT "StorageLocation_fridgeId_fkey" FOREIGN KEY ("fridgeId") REFERENCES "Fridge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InputHistory" ADD CONSTRAINT "InputHistory_fridgeId_fkey" FOREIGN KEY ("fridgeId") REFERENCES "Fridge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Food" ADD CONSTRAINT "Food_storageLocationId_fkey" FOREIGN KEY ("storageLocationId") REFERENCES "StorageLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
