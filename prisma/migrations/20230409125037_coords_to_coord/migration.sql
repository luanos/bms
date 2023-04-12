/*
  Warnings:

  - You are about to drop the column `xCoords` on the `Waypoint` table. All the data in the column will be lost.
  - You are about to drop the column `yCoords` on the `Waypoint` table. All the data in the column will be lost.
  - You are about to drop the column `zCoords` on the `Waypoint` table. All the data in the column will be lost.
  - Added the required column `xCoord` to the `Waypoint` table without a default value. This is not possible if the table is not empty.
  - Added the required column `yCoord` to the `Waypoint` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zCoord` to the `Waypoint` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Waypoint" DROP COLUMN "xCoords",
DROP COLUMN "yCoords",
DROP COLUMN "zCoords",
ADD COLUMN     "xCoord" INTEGER NOT NULL,
ADD COLUMN     "yCoord" INTEGER NOT NULL,
ADD COLUMN     "zCoord" INTEGER NOT NULL;
