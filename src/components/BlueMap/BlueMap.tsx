"use client";
import { useEffect, useRef } from "react";

import s from "./BlueMap.module.scss";
import { useMapHandle } from "~/client/state";
import { BlueMapApp } from "~/vendor/bluemap/BlueMapApp";

import type { WorldType } from "@prisma/client";
import type { Map } from "~/client/state";

const WorldTypeMap: Record<WorldType, string> = {
  OVERWORLD: "world",
  NETHER: "world_nether",
  END: "world_the_end",
};

export default function BlueMap() {
  const { registerMap, unregisterMap } = useMapHandle();
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!containerRef.current) return;

    const bluemap = new BlueMapApp(containerRef.current);
    bluemap.load().then(() => console.log(bluemap.maps));

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
