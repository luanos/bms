"use client";

import { WorldType } from "@prisma/client";
import * as ToggleGroup from "@radix-ui/react-toggle-group";

import s from "./MapOverlay.module.scss";
import { useCurrentWorld, useLocation, useServerStatus } from "~/client/state";
import { Pill } from "~/components/BaseUI/Pill";
import { Separator } from "~/components/BaseUI/Separator";
import { worldTypeDisplayName } from "~/displaynames";

export function MapOverlay() {
  return (
    <div className={s.mapOverlay}>
      <WorldSwitch />
      <StatusDisplay />
      <CoordinateDisplay />
    </div>
  );
}

function WorldSwitch() {
  const { currentWorld, switchCurrentWorld } = useCurrentWorld();
  if (!currentWorld) return null;
  return (
    <ToggleGroup.Root
      type="single"
      className={s.worldSwitchRoot}
      value={currentWorld}
      onValueChange={(val) => val && switchCurrentWorld?.(val as WorldType)}
    >
      {Object.keys(WorldType).map((type) => (
        <ToggleGroup.Item className={s.worldSwitchItem} value={type} key={type}>
          {worldTypeDisplayName[type as WorldType]}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}

function StatusDisplay() {
  const status = useServerStatus();

  if (!status) return null;

  return <Pill>{status.state}</Pill>;
}

function CoordinateDisplay() {
  const location = useLocation();
  if (!location) return null;
  return (
    <Pill className={s.coords}>
      {location.xPos}
      <Separator className={s.separator} orientation="vertical" />
      {location.yPos}
    </Pill>
  );
}
