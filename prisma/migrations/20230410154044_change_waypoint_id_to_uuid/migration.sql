/*
  Warnings:

  - The primary key for the `Waypoint` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "_waypoint_visible" DROP CONSTRAINT "_waypoint_visible_B_fkey";

-- AlterTable
ALTER TABLE "Waypoint" DROP CONSTRAINT "Waypoint_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Waypoint_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Waypoint_id_seq";

-- AlterTable
ALTER TABLE "_waypoint_visible" ALTER COLUMN "B" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "_waypoint_visible" ADD CONSTRAINT "_waypoint_visible_B_fkey" FOREIGN KEY ("B") REFERENCES "Waypoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;
