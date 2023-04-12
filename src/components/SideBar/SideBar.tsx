import s from "./SideBar.module.scss";
import { Waypoints } from "~/components/Waypoints";
import { getUser } from "~/session";
import { getVisibleWaypoints } from "~/waypoints";

export async function SideBar() {
  let user = await getUser();
  let waypoints = await getVisibleWaypoints(user.id);
  let ownWaypoints = waypoints.filter(
    (waypoint) => waypoint.ownerId === user.id
  );

  let otherWaypoints = waypoints.filter(
    (waypoint) => waypoint.ownerId !== user.id
  );
  return (
    <div className={s.sideBar}>
      <Waypoints ownWaypoints={ownWaypoints} otherWaypoints={otherWaypoints} />
    </div>
  );
}
