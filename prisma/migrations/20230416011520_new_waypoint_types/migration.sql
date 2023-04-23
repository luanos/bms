/*
  Warnings:

  - The values [BUILDING] on the enum `WaypointType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "WaypointType_new" AS ENUM ('PRIVATE_BUILDING', 'PUBLIC_BUILDING', 'PRIVATE_FARM', 'PUBLIC_FARM', 'PORTAL', 'POINT_OF_INTEREST', 'OTHER');
ALTER TABLE "Waypoint" ALTER COLUMN "waypointType" TYPE "WaypointType_new" USING ("waypointType"::text::"WaypointType_new");
ALTER TYPE "WaypointType" RENAME TO "WaypointType_old";
ALTER TYPE "WaypointType_new" RENAME TO "WaypointType";
DROP TYPE "WaypointType_old";
COMMIT;
