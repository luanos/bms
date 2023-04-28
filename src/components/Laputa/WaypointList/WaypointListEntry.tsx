import clsx from "clsx";

import s from "./WaypointListEntry.module.scss";
import { WaypointFormDialog } from "../WaypointForm";
import { highlightString } from "~/client/highlightString";
import { serializeWaypoint } from "~/client/serializeWaypoint";
import { useFocusedWaypointActions, useMap, useUser } from "~/client/state";
import { Stack } from "~/components/BaseUI/Stack";
import { EpUser, EpView, EpEdit, EpCopyDocument } from "~/components/Icons";
import {
  WaypointTypeToDisplayName,
  VisibilityToDisplayName,
  WaypointTypeToIconComponent,
} from "~/config";

import type Fuse from "fuse.js";
import type { CSSProperties, HTMLProps, ReactNode } from "react";
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
  const Icon = WaypointTypeToIconComponent[waypoint.waypointType];
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
        <Stack
          className={s.waypointInfo}
          orientation="horizontal"
          gap="1rem"
          separated
        >
          <span>{WaypointTypeToDisplayName[waypoint.waypointType]}</span>
          <span className={s.infoShared}>
            {type == "MY_WAYPOINTS" ? (
              <>
                <EpView />
                <span>{VisibilityToDisplayName[waypoint.visibility]}</span>
              </>
            ) : (
              <>
                <EpUser />
                <span>{waypoint.owner.username}</span>
              </>
            )}
          </span>
        </Stack>
        {/* <WaypointInfo
          waypoint={waypoint}
          view={type}
          style={{ gridArea: "info" }}
        /> */}
      </div>
      <div className={s.actionsOverlay}>
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
            e.currentTarget.blur();
            navigator.clipboard.writeText(serializeWaypoint(waypoint));
          }}
        >
          <EpCopyDocument />
        </button>
      </div>
    </div>
  );
}
