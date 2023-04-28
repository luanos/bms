"use client";
import { useEffect, useRef, useState } from "react";

import s from "./BlueMap.module.scss";
import { WaypointForm } from "../Laputa/WaypointForm";
import {
  useFocusedWaypoint,
  useFocusedWaypointActions,
  useMapHandle,
  useWaypoints,
} from "~/client/state";
import * as Dialog from "~/components/BaseUI/Dialog";
import { BlueMapToWorldType, WorldTypeToBlueMap } from "~/config";
import { MarkerSet } from "~/vendor/bluemap/BlueMap";
import { BlueMapApp } from "~/vendor/bluemap/BlueMapApp";
import { WaypointMarker } from "~/vendor/bluemap/markers/WaypointMarker";

import type { WorldType } from "@prisma/client";
import type { Map } from "~/client/state";
import type { Waypoint } from "~/types";

export default function BlueMap() {
  const { registerMap, unregisterMap, currentWorld, setCurrentWorld } =
    useMapHandle();
  const containerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<MarkerSet>();
  const { focusWaypoint } = useFocusedWaypointActions();
  const [bluemap, setBluemap] = useState<BlueMapApp | null>(null);
  const waypoints = useWaypoints();
  const focusedWaypoint = useFocusedWaypoint();
  const [initialWaypoint, setInitialWaypoint] =
    useState<Partial<Waypoint> | null>(null);
  useEffect(() => {
    if (!bluemap || !markerRef.current) return;

    const markerSet = markerRef.current;

    markerSet.markers.forEach((marker) => {
      marker.dispose();
    });

    markerSet.markers.clear();
    waypoints.forEach((waypoint) => {
      if (waypoint.worldType === currentWorld) {
        const marker = new WaypointMarker(
          waypoint,
          () => focusWaypoint(waypoint.id),
          waypoint.id === focusedWaypoint?.id
        );
        markerSet.add(marker);
      }
    });
  }, [waypoints, bluemap, focusWaypoint, currentWorld, focusedWaypoint]);

  useEffect(() => {
    if (!containerRef.current) return;

    const bluemap = new BlueMapApp(
      containerRef.current,
      (worldType: WorldType, xCoord: number, zCoord: number, yCoord?: number) =>
        setInitialWaypoint({ xCoord, yCoord, zCoord, worldType })
    );
    bluemap.load().then(() => {
      markerRef.current = new MarkerSet("waypoints");
      bluemap.mapViewer.markers.add(markerRef.current);
      setBluemap(bluemap);
      setCurrentWorld(BlueMapToWorldType[bluemap.mapViewer.map.data.id]);
    });
    const map: Map = {
      async switchCurrentWorld(world) {
        console.log(world);
        await bluemap.switchMap(WorldTypeToBlueMap[world], true);
        setCurrentWorld(world);
      },
      updateHash() {
        bluemap.updatePageAddress();
      },
      async panToLocation(world, x, y, z) {
        if (
          WorldTypeToBlueMap[world] !== (bluemap.mapViewer.data.map as any).id
        ) {
          await bluemap.switchMap(WorldTypeToBlueMap[world], false);
          setCurrentWorld(world);
        }
        bluemap.mapViewer.controlsManager.position.x = x;
        bluemap.mapViewer.controlsManager.position.y = y;
        bluemap.mapViewer.controlsManager.position.z = z;
      },
    };

    registerMap(map);

    return () => unregisterMap();
  }, [registerMap, unregisterMap, setCurrentWorld]);
  return (
    <>
      <Dialog.Root
        open={!!initialWaypoint}
        onOpenChange={() => setInitialWaypoint(null)}
      >
        <Dialog.Main title="Wegpunkt Erstellen">
          {initialWaypoint && (
            <WaypointForm
              onSubmit={() => setInitialWaypoint(null)}
              waypoint={initialWaypoint}
            />
          )}
        </Dialog.Main>
      </Dialog.Root>
      <div className={s.root} ref={containerRef}></div>
    </>
  );
}
