"use client";
import { useEffect, useRef, useState } from "react";

import s from "./BlueMap.module.scss";
import {
  useFocusedWaypointActions,
  useMapHandle,
  useWaypoints,
} from "~/client/state";
import { MarkerSet } from "~/vendor/bluemap/BlueMap";
import { BlueMapApp } from "~/vendor/bluemap/BlueMapApp";
import { WaypointMarker } from "~/vendor/bluemap/markers/WaypointMarker";

import type { WorldType } from "@prisma/client";
import type { Map } from "~/client/state";
import type { Waypoint } from "~/types";

const WorldTypeToBlueMap: Record<WorldType, string> = {
  OVERWORLD: "world",
  NETHER: "world_nether",
  END: "world_the_end",
};

const BlueMapToWorldType: Record<string, WorldType> = {
  world: "OVERWORLD",
  world_nether: "NETHER",
  world_the_end: "END",
};

export default function BlueMap() {
  const { registerMap, unregisterMap } = useMapHandle();
  const containerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<MarkerSet>();
  const { focusWaypoint } = useFocusedWaypointActions();
  const [bluemap, setBluemap] = useState<BlueMapApp | null>(null);
  const [worldType, setWorldType] = useState<WorldType>();
  const waypoints = useWaypoints();

  useEffect(() => {
    if (!bluemap) return;
    if (!markerRef.current) {
      markerRef.current = new MarkerSet("waypoints");
      bluemap.mapViewer.markers.add(markerRef.current);
    }

    const markerSet = markerRef.current;

    markerSet.markers.forEach((marker) => {
      marker.dispose();
    });

    markerSet.markers.clear();
    waypoints.forEach((waypoint) => {
      if (waypoint.worldType === worldType) {
        const marker = new WaypointMarker(waypoint, () =>
          focusWaypoint(waypoint.id)
        );
        markerSet.add(marker);
      }
    });
  }, [waypoints, bluemap, focusWaypoint, worldType]);

  useEffect(() => {
    if (!containerRef.current) return;

    const bluemap = new BlueMapApp(containerRef.current);
    bluemap.load().then(() => {
      setBluemap(bluemap);
      setWorldType(BlueMapToWorldType[bluemap.mapViewer.map.data.id]);
    });
    const map: Map = {
      async switchMap(world) {
        await bluemap.switchMap(WorldTypeToBlueMap[world], false);
        setWorldType(world);
      },
      updateHash() {
        bluemap.updatePageAddress();
      },
      async panToLocation(world, x, y, z) {
        await bluemap.switchMap(WorldTypeToBlueMap[world], false);
        setWorldType(world);
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
