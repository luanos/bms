import { useFocusedWaypointActions } from "~/client/state";

import type { Waypoint } from "~/types";

interface WaypointDetailProps {
  waypoint: Waypoint;
}
export function WaypointDetail({ waypoint }: WaypointDetailProps) {
  const a = useFocusedWaypointActions();
  return (
    <div>
      <button onClick={a.blurWaypoint}>back</button>
      {JSON.stringify(waypoint)}
    </div>
  );
}
