-- CreateEnum
CREATE TYPE "WaypointType" AS ENUM ('BUILDING');

-- AlterTable
ALTER TABLE "Waypoint" ADD COLUMN     "waypointType" "WaypointType" NOT NULL DEFAULT 'BUILDING';
