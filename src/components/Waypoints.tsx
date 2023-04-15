"use client";
import { useWaypointUtils, useWaypoints } from "~/state";

import type { Waypoint } from "~/types";

export function Waypoints() {
  const waypoints = useWaypoints();
  return (
    <div>
      {waypoints.map((wp) => (
        <WaypointDisplay waypoint={wp} key={wp.id} />
      ))}
      -------
      <WaypointAddForm />
    </div>
  );
}

interface WaypointDisplayProps {
  waypoint: Waypoint;
}

function WaypointDisplay({ waypoint }: { waypoint: Waypoint }) {
  const { deleteWaypoint } = useWaypointUtils();
  return (
    <p>
      {waypoint.name}{" "}
      <button onClick={() => deleteWaypoint(waypoint.id)}>DELETE</button>
    </p>
  );
}

function WaypointAddForm() {
  const { addWaypoint } = useWaypointUtils();
  const onSubmit = () => {
    addWaypoint({
      name: "Blub",
      worldType: "OVERWORLD",
      visibility: "ALL",
      visibleTo: [],
      xCoord: 0,
      yCoord: 0,
      zCoord: 0,
    });
  };

  return <button onClick={onSubmit}>ADD WP</button>;
}
