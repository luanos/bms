-- CreateEnum
CREATE TYPE "WorldType" AS ENUM ('OVERWORLD', 'NETHER', 'END');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('ALL', 'SELECT', 'PRIVATE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Waypoint" (
    "id" SERIAL NOT NULL,
    "ownerId" TEXT NOT NULL,
    "worldType" TEXT NOT NULL,
    "visibility" TEXT NOT NULL,
    "xCoords" INTEGER NOT NULL,
    "yCoords" INTEGER NOT NULL,
    "zCoords" INTEGER NOT NULL,

    CONSTRAINT "Waypoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_waypoint_visible" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_waypoint_visible_AB_unique" ON "_waypoint_visible"("A", "B");

-- CreateIndex
CREATE INDEX "_waypoint_visible_B_index" ON "_waypoint_visible"("B");

-- AddForeignKey
ALTER TABLE "Waypoint" ADD CONSTRAINT "Waypoint_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_waypoint_visible" ADD CONSTRAINT "_waypoint_visible_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_waypoint_visible" ADD CONSTRAINT "_waypoint_visible_B_fkey" FOREIGN KEY ("B") REFERENCES "Waypoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;
