import clsx from "clsx";

import s from "./WaypointInfo.module.scss";
import { Separator } from "~/components/BaseUI/Separator";
import { EpUser, EpView } from "~/components/Icons";
import { waypointTypeDisplayName, visibilityDisplayName } from "~/displaynames";

import type { ReactNode, CSSProperties } from "react";
import type { Waypoint } from "~/types";

interface WaypointInfoProps {
  waypoint: Waypoint;
  view?: "EXPLORE" | "MY_WAYPOINTS" | "SEARCH";
  style?: CSSProperties;
  className?: string;
}

export default function WaypointInfo({
  waypoint,
  view = "EXPLORE",
  style,
  className,
}: WaypointInfoProps) {
  return (
    <div className={clsx(s.root, className)} style={style}>
      <InfoType waypointType={waypoint.waypointType} />
      <Separator className={s.separator} orientation="vertical" />
      <span className={s.infoShared}>
        {view == "MY_WAYPOINTS" ? (
          <>
            <EpView />
            <span>{visibilityDisplayName[waypoint.visibility]}</span>
          </>
        ) : (
          <>
            <EpUser />
            <span>{waypoint.owner.username}</span>
          </>
        )}
      </span>
    </div>
  );
}

interface InfoTypeProps {
  waypointType:
    | "PRIVATE_BUILDING"
    | "PUBLIC_BUILDING"
    | "PRIVATE_FARM"
    | "PUBLIC_FARM"
    | "PORTAL"
    | "POINT_OF_INTEREST"
    | "OTHER";
}

function InfoType({ waypointType }: InfoTypeProps) {
  return (
    <span className={s.infoType}>{waypointTypeDisplayName[waypointType]}</span>
  );
}

export { InfoType };
