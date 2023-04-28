"use client";
import s from "./Laputa.module.scss";
import { WaypointDetail } from "./WaypointDetail";
import { WaypointOverview } from "./WaypointOverview";
import { useFocusedWaypoint } from "~/client/state";

export function Laputa() {
  const waypoint = useFocusedWaypoint();
  return (
    <nav className={s.root}>
      {waypoint ? <WaypointDetail waypoint={waypoint} /> : <WaypointOverview />}
    </nav>
  );
}
