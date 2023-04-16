import Image from "next/image";

import s from "./WaypointListEntry.module.scss";
import { useMap } from "~/client/state";
import { EpUser } from "~/components/Icons";
import { Waypoint } from "~/types";

import type { WorldType } from "@prisma/client";

interface WaypointListEntryProps {
  waypoint: Waypoint;
}

export function WaypointListEntry({ waypoint }: WaypointListEntryProps) {
  const map = useMap();
  return (
    <div className={s.root}>
      <Image src="/natural-icon.png" alt="" width={16} height={16} />
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
        <span className={s.infoShared}>
          <EpUser />
          {waypoint.owner.username}
        </span>
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
    <div className={s.coordinateDisplay}>
      <span>{world.substring(0, 1)}</span>
      <span>{x}</span>
      <span>{y}</span>
      <span>{z}</span>
    </div>
  );
}
