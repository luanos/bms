"use client";
import { useEffect, useRef, useState } from "react";

import s from "./BlueMap.module.scss";
import {
  useFocusedWaypointActions,
  useMapHandle,
  useWaypoints,
} from "~/client/state";
import { HtmlMarker, MarkerSet, PoiMarker } from "~/vendor/bluemap/BlueMap";
import { BlueMapApp } from "~/vendor/bluemap/BlueMapApp";
import { WaypointMarker } from "~/vendor/bluemap/markers/WaypointMarker";

import type { WorldType } from "@prisma/client";
import type { Map } from "~/client/state";
import type { Waypoint } from "~/types";

const WorldTypeMap: Record<WorldType, string> = {
  OVERWORLD: "world",
  NETHER: "world_nether",
  END: "world_the_end",
};

export default function BlueMap() {
  const { registerMap, unregisterMap } = useMapHandle();
  const containerRef = useRef<HTMLDivElement>(null);
  const { focusWaypoint } = useFocusedWaypointActions();
  const [bluemap, setBluemap] = useState<BlueMapApp | null>(null);
  const waypoints = useWaypoints();

  useEffect(() => {
    if (!bluemap) return;
    const markerSet = new MarkerSet("waypoints");
    waypoints.forEach((waypoint) => {
      if (
        WorldTypeMap[waypoint.worldType] ===
        (bluemap.mapViewer.data.map as any).id
      ) {
        const marker = new WaypointMarker(waypoint, () =>
          focusWaypoint(waypoint.id)
        );
        markerSet.add(marker);
      }
    });
    bluemap.mapViewer.markers.add(markerSet);
  }, [waypoints, bluemap, focusWaypoint]);

  useEffect(() => {
    if (!containerRef.current) return;

    const bluemap = new BlueMapApp(containerRef.current);
    bluemap.load().then(() => {
      setBluemap(bluemap);
    });

    const map: Map = {
      switchMap(world) {
        bluemap.switchMap(WorldTypeMap[world], false);
      },
      updateHash() {
        bluemap.updatePageAddress();
      },
      async panToLocation(world, x, y, z) {
        await bluemap.switchMap(WorldTypeMap[world], false);
        bluemap.mapViewer.controlsManager.position.x = x;
        bluemap.mapViewer.controlsManager.position.y = y;
        bluemap.mapViewer.controlsManager.position.z = z;
      },
    };

    registerMap(map);

    return () => unregisterMap();
  }, [registerMap, unregisterMap]);
  return <div className={s.root} ref={containerRef}></div>;
}
