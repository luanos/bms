/*
  Warnings:

  - Changed the type of `worldType` on the `Waypoint` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `visibility` on the `Waypoint` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Waypoint" DROP COLUMN "worldType",
ADD COLUMN     "worldType" "WorldType" NOT NULL,
DROP COLUMN "visibility",
ADD COLUMN     "visibility" "Visibility" NOT NULL;
