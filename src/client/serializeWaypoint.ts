import { WorldTypeToDisplayName } from "~/config";

import type { Waypoint } from "~/types";

export function serializeWaypoint(waypoint: Waypoint) {
  return `${waypoint.name} (${waypoint.xCoord}/${waypoint.yCoord}/${
    waypoint.zCoord
  } - ${WorldTypeToDisplayName[waypoint.worldType]})`;
}
