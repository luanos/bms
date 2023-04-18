"use client";
import s from "./Page.module.scss";
import { useLocation, useServerStatus } from "~/client/state";
import { Pill } from "~/components/BaseUI/Pill";
import { Separator } from "~/components/BaseUI/Separator";
import { Laputa } from "~/components/Laputa";
import { User } from "~/components/User";

export default function Index() {
  return (
    <>
      <Laputa />
      <User />
      <div className={s.mapOverlay}>
        <StatusDisplay />
        <CoordinateDisplay />
      </div>
    </>
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
