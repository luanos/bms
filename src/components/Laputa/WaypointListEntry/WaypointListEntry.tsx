import s from "./WaypointListEntry.module.scss";
import { useMap } from "~/state";
import { Waypoint } from "~/types";

import type { WorldType } from "@prisma/client";

interface WaypointListEntryProps {
  waypoint: Waypoint;
}

export function WaypointListEntry({ waypoint }: WaypointListEntryProps) {
  const map = useMap();
  return (
    <div className={s.root}>
      <h3
        className={s.name}
        onClick={() =>
          map?.panToLocation(waypoint.xCoord, waypoint.yCoord, waypoint.zCoord)
        }
      >
        {waypoint.name}
      </h3>
      <div className={s.info}>
        <span className={s.infoType}></span>
        <span className={s.infoShared}>{waypoint.owner.username}</span>
      </div>
      <CoordinateDisplay
        world={waypoint.worldType}
        x={waypoint.xCoord}
        y={waypoint.yCoord}
        z={waypoint.zCoord}
      />
    </div>
  );
}

interface CoordinateDisplayProps {
  world: WorldType;
  x: number;
  y: number;
  z: number;
}

function CoordinateDisplay({ world, x, y, z }: CoordinateDisplayProps) {
  return (
    <table className={s.coordinateDisplay}>
      <tbody>
        <tr>
          <td>{world}</td>
          <td>{x}</td>
          <td>{y}</td>
          <td>{z}</td>
        </tr>
      </tbody>
    </table>
  );
}
