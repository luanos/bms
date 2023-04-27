import s from "./WaypointDetail.module.scss";
import { WaypointFormDialog } from "../WaypointForm";
import { serializeWaypoint } from "~/client/serializeWaypoint";
import { useFocusedWaypointActions, useUser, useMap } from "~/client/state";
import CoordinateDisplay from "~/components/BaseUI/CoordinateDisplay";
import WaypointInfo from "~/components/BaseUI/WaypointInfo/WaypointInfo";
import {
  EpArrowRightBold,
  EpCopyDocument,
  EpAim,
  EpEdit,
} from "~/components/Icons";

import type { Waypoint } from "~/types";
interface WaypointDetailProps {
  waypoint: Waypoint;
}
export function WaypointDetail({ waypoint }: WaypointDetailProps) {
  const { blurWaypoint } = useFocusedWaypointActions();
  const updatedAt = new Date(waypoint.updatedAt);
  const { user } = useUser();
  const map = useMap();
  const owned = user.id == waypoint.owner.id;
  return (
    <div className={s.root}>
      <div className={s.topBar}>
        <button className={s.blurWaypoint} onClick={blurWaypoint}>
          <EpArrowRightBold style={{ transform: "rotate(180deg)" }} />
        </button>
        <h1
          className={s.name}
          onClick={() =>
            map?.panToLocation(
              waypoint.worldType,
              waypoint.xCoord,
              waypoint.yCoord,
              waypoint.zCoord
            )
          }
        >
          {waypoint.name}
        </h1>
      </div>
      <div className={s.middleSection}>
        <div className={s.info}>
          <WaypointInfo waypoint={waypoint} />
          <CoordinateDisplay
            world={waypoint.worldType}
            x={waypoint.xCoord}
            y={waypoint.yCoord}
            z={waypoint.zCoord}
          />
        </div>
        {waypoint.description && (
          <p className={s.description}>{waypoint.description}</p>
        )}
      </div>
      <div className={s.bottomBar}>
        <p className={s.updatedAt}>
          {"Zuletzt geändert: "} &nbsp;
          <strong>
            {`${updatedAt.toLocaleDateString("de-DE", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })} Uhr`}
          </strong>
        </p>
        <div className={s.actions}>
          {owned && (
            <WaypointFormDialog waypoint={waypoint}>
              <button aria-label="Wegpunkt bearbeiten">
                <EpEdit />
              </button>
            </WaypointFormDialog>
          )}
          <button
            aria-label="Wegpunkt Link Kopieren"
            onClick={(e) => {
              navigator.clipboard.writeText(serializeWaypoint(waypoint));
            }}
          >
            <EpCopyDocument />
          </button>
        </div>
      </div>
    </div>
  );
}
