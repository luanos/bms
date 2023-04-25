import s from "./CoordinateDisplay.module.scss";

import type { WorldType } from "@prisma/client";

interface CoordinateDisplayProps {
  world: WorldType;
  x: number;
  y: number;
  z: number;
}

export default function CoordinateDisplay({
  world,
  x,
  y,
  z,
}: CoordinateDisplayProps) {
  return (
    <div className={s.root}>
      <span>{world.substring(0, 1)}</span>
      <span>{x}</span>
      <span>{y}</span>
      <span>{z}</span>
    </div>
  );
}
