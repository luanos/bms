import clsx from "clsx";
import Image from "next/image";

import s from "./WaypointListEntry.module.scss";
import { useFocusedWaypointActions, useUser } from "~/client/state";
import { Separator } from "~/components/BaseUI/Separator";
import { EpUser, EpView, EpEdit, EpCopyDocument } from "~/components/Icons";
import { waypointTypeDisplayName, visibilityDisplayName } from "~/displaynames";

import type { WorldType } from "@prisma/client";
import type { HTMLProps } from "react";
import type { Waypoint } from "~/types";

interface WaypointListEntryProps extends HTMLProps<HTMLDivElement> {
  waypoint: Waypoint;
  type: "EXPLORE" | "MY_WAYPOINTS";
}

export function WaypointListEntry({
  waypoint,
  className,
  type,
  ...props
}: WaypointListEntryProps) {
  const { user } = useUser();
  const { focusWaypoint } = useFocusedWaypointActions();
  const owned = user.id == waypoint.owner.id;
  return (
    <div className={clsx(s.root, className)} {...props}>
      <div className={s.content}>
        <div className={s.iconWrapper}>
          <Image src="/natural-icon.png" alt="" fill />
        </div>
        <h3 className={s.name}>
          <button onClick={() => focusWaypoint(waypoint.id)}>
            {waypoint.name}
          </button>
        </h3>
        <CoordinateDisplay
          world={waypoint.worldType}
          x={waypoint.xCoord}
          y={waypoint.yCoord}
          z={waypoint.zCoord}
        />
        <div className={s.info}>
          <span className={s.infoType}>
            {waypointTypeDisplayName[waypoint.waypointType]}
          </span>
          <Separator className={s.separator} orientation="vertical" />
          <span className={s.infoShared}>
            {type == "MY_WAYPOINTS" ? (
              <>
                <EpView />
                <span>{visibilityDisplayName[waypoint.visibility]}</span>
              </>
            ) : (
              <>
                <EpUser />
                {waypoint.owner.username}
              </>
            )}
          </span>
        </div>
      </div>

      <div className={s.actionsOverlay}>
        {owned && (
          <button aria-label="Wegpunkt bearbeiten">
            <EpEdit />
          </button>
        )}
        <button
          aria-label="Wegpunkt Link Kopieren"
          onClick={(e) => e.currentTarget.blur()}
        >
          <EpCopyDocument />
        </button>
      </div>
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
