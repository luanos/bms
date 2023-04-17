import clsx from "clsx";
import Image from "next/image";

import s from "./WaypointListEntry.module.scss";
import { highlightString } from "~/client/highlightString";
import { useFocusedWaypointActions, useUser } from "~/client/state";
import { Separator } from "~/components/BaseUI/Separator";
import { EpUser, EpView, EpEdit, EpCopyDocument } from "~/components/Icons";
import { waypointTypeDisplayName, visibilityDisplayName } from "~/displaynames";

import type { WorldType } from "@prisma/client";
import type Fuse from "fuse.js";
import type { HTMLProps, ReactNode } from "react";
import type { Waypoint } from "~/types";

interface WaypointListEntryTabProps extends HTMLProps<HTMLDivElement> {
  waypoint: Waypoint;
  type: "EXPLORE" | "MY_WAYPOINTS";
}

interface WaypointListEntrySearchProps extends HTMLProps<HTMLDivElement> {
  waypoint: Fuse.FuseResult<Waypoint>;
  type: "SEARCH";
}
type WaypointListEntryProps =
  | WaypointListEntrySearchProps
  | WaypointListEntryTabProps;

interface FormattedNameProps {
  stringToFormat: string;
  match?: Fuse.FuseResultMatch;
}
function FormattedName({ stringToFormat, match }: FormattedNameProps) {
  if (!match) return <>{stringToFormat}</>;
  const str = highlightString(stringToFormat, match.indices);

  return (
    <>
      {str.map((a, i) =>
        a.em ? (
          <span className={s.highlight} key={i}>
            {a.val}
          </span>
        ) : (
          <>{a.val}</>
        )
      )}
    </>
  );
}

export function WaypointListEntry({
  waypoint: waypointOrSearchResult,
  className,
  type,
  ...props
}: WaypointListEntryProps) {
  const { user } = useUser();
  const { focusWaypoint } = useFocusedWaypointActions();

  let waypoint: Waypoint;
  let waypointName: ReactNode;
  let ownerName: ReactNode;
  if (type == "SEARCH") {
    waypoint = waypointOrSearchResult.item;
    waypointName = (
      <FormattedName
        stringToFormat={waypoint.name}
        match={waypointOrSearchResult.matches?.find(
          (match) => match.key == "name"
        )}
      />
    );
    ownerName = (
      <FormattedName
        stringToFormat={waypoint.owner.username}
        match={waypointOrSearchResult.matches?.find(
          (match) => match.key == "owner.username"
        )}
      />
    );
  } else {
    waypoint = waypointOrSearchResult;
    waypointName = waypoint.name;
    ownerName = waypoint.owner.username;
  }

  const owned = user.id == waypoint.owner.id;
  return (
    <div className={clsx(s.root, className)} {...props}>
      <div className={s.content}>
        <div className={s.iconWrapper}>
          <Image src="/natural-icon.png" alt="" fill />
        </div>
        <h3 className={s.name}>
          <button onClick={() => focusWaypoint(waypoint.id)}>
            {waypointName}
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
                <span>{ownerName}</span>
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
