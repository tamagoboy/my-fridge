-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "googleId" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fridge" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'マイ冷蔵庫',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fridge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FridgeMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fridgeId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FridgeMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FridgeInvitation" (
    "id" TEXT NOT NULL,
    "fridgeId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FridgeInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Food" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "storageLocation" TEXT,
    "fridgeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Food_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "FridgeMember_userId_key" ON "FridgeMember"("userId");

-- CreateIndex
CREATE INDEX "FridgeMember_fridgeId_idx" ON "FridgeMember"("fridgeId");

-- CreateIndex
CREATE UNIQUE INDEX "FridgeInvitation_token_key" ON "FridgeInvitation"("token");

-- CreateIndex
CREATE INDEX "Food_fridgeId_idx" ON "Food"("fridgeId");

-- CreateIndex
CREATE INDEX "Food_fridgeId_storageLocation_idx" ON "Food"("fridgeId", "storageLocation");

-- CreateIndex
CREATE INDEX "Food_fridgeId_expiryDate_idx" ON "Food"("fridgeId", "expiryDate");

-- AddForeignKey
ALTER TABLE "FridgeMember" ADD CONSTRAINT "FridgeMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FridgeMember" ADD CONSTRAINT "FridgeMember_fridgeId_fkey" FOREIGN KEY ("fridgeId") REFERENCES "Fridge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FridgeInvitation" ADD CONSTRAINT "FridgeInvitation_fridgeId_fkey" FOREIGN KEY ("fridgeId") REFERENCES "Fridge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Food" ADD CONSTRAINT "Food_fridgeId_fkey" FOREIGN KEY ("fridgeId") REFERENCES "Fridge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
