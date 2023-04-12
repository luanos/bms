import type { Waypoint } from "@prisma/client";

export function serializeWaypoint({
  xCoord,
  yCoord,
  zCoord,
  worldType,
}: Waypoint): string {
  return `wp:${xCoord}:${yCoord}:${zCoord}:${worldType.charAt(0)}`;
}
