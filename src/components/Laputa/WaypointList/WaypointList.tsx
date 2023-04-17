import * as ScrollArea from "@radix-ui/react-scroll-area";
import { memo, useEffect, useRef, useState } from "react";

import s from "./WaypointList.module.scss";
import { WaypointListEntry } from "./WaypointListEntry";

import type Fuse from "fuse.js";
import type { Waypoint } from "~/types";
interface WaypointListTabProps {
  waypoints: Waypoint[];
  type: "EXPLORE" | "MY_WAYPOINTS";
}

interface WaypointListSearchProps {
  type: "SEARCH";
  waypoints: Fuse.FuseResult<Waypoint>[];
}

type WaypointListProps = WaypointListTabProps | WaypointListSearchProps;

export const WaypointList = memo(function WaypointList({
  waypoints,
  type,
}: WaypointListProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number>(0);
  const [active, setActive] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    viewportRef.current && (viewportRef.current.scrollTop = 0);
  }, [waypoints]);
  return (
    <ScrollArea.Root className={s.root}>
      <ScrollArea.Viewport
        ref={viewportRef}
        className={s.viewPort}
        onMouseEnter={() => setTimeout(() => setActive(true), 10)}
        onMouseLeave={() => setActive(false)}
      >
        {type == "SEARCH"
          ? waypoints.map((waypoint, index) => (
              <WaypointListEntry
                type={type}
                waypoint={waypoint}
                key={waypoint.item.id}
                onMouseEnter={() => setHoveredIndex(index)}
              />
            ))
          : waypoints.map((waypoint, index) => (
              <WaypointListEntry
                type={type}
                waypoint={waypoint}
                key={waypoint.id}
                onMouseEnter={() => setHoveredIndex(index)}
              />
            ))}
        <div
          className={s.background}
          style={{
            transform: `translateY(calc(${hoveredIndex} * var(--_list-entry-height)))`,
          }}
          data-state={active ? "active" : "inactive"}
        />
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar className={s.scrollbar} orientation="vertical">
        <ScrollArea.Thumb className={s.scrollbarThumb} />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
});
