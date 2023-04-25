import { worldTypeDisplayName } from "~/displaynames";

import type { Waypoint } from "~/types";

export function serializeWaypoint(waypoint: Waypoint) {
  return `${waypoint.name} (${waypoint.xCoord}/${waypoint.yCoord}/${
    waypoint.zCoord
  } - ${worldTypeDisplayName[waypoint.worldType]})`;
}
