import clsx from "clsx";
import Image from "next/image";

import s from "./WaypointListEntry.module.scss";
import { WaypointForm } from "../WaypointForm";
import { highlightString } from "~/client/highlightString";
import { useFocusedWaypointActions, useMap, useUser } from "~/client/state";
import { Separator } from "~/components/BaseUI/Separator";
import {
  EpUser,
  EpView,
  EpEdit,
  EpCopyDocument,
  WaypointTypeBuilding,
  WaypointTypeFarm,
  WaypointTypePortal,
} from "~/components/Icons";
import { waypointTypeDisplayName, visibilityDisplayName } from "~/displaynames";

import type { WaypointType, WorldType } from "@prisma/client";
import type Fuse from "fuse.js";
import type { CSSProperties, HTMLProps, ReactNode } from "react";
import type { Waypoint } from "~/types";

export const waypointTypeIconComponent: Record<WaypointType, React.FC> = {
  PRIVATE_BUILDING: WaypointTypeBuilding,
  PUBLIC_BUILDING: WaypointTypeBuilding,
  PRIVATE_FARM: WaypointTypeFarm,
  PUBLIC_FARM: WaypointTypeFarm,
  PORTAL: WaypointTypePortal,
  POINT_OF_INTEREST: WaypointTypePortal,
  OTHER: WaypointTypePortal,
};

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
  const map = useMap();

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
  const Icon = waypointTypeIconComponent[waypoint.waypointType];
  return (
    <div className={clsx(s.root, className)} {...props}>
      <div
        className={s.content}
        style={{ "--_gradient-size": owned ? "64px" : "24px" } as CSSProperties}
      >
        <div className={s.iconWrapper}>
          <Icon />
        </div>
        <h3 className={s.name}>
          <button
            onClick={() => {
              focusWaypoint(waypoint.id);
              map?.panToLocation(
                waypoint.worldType,
                waypoint.xCoord,
                waypoint.yCoord,
                waypoint.zCoord
              );
            }}
          >
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
          <WaypointForm waypoint={waypoint}>
            <button aria-label="Wegpunkt bearbeiten">
              <EpEdit />
            </button>
          </WaypointForm>
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
