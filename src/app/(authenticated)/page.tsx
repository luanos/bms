"use client";
import s from "./Page.module.scss";
import { Pill } from "~/components/BaseUI/Pill";
import { Separator } from "~/components/BaseUI/Separator";
import { Laputa } from "~/components/Laputa";
import { User } from "~/components/User";
import { useLocation } from "~/state";

export default function Index() {
  return (
    <>
      <Laputa />
      <User />
      <div className={s.mapOverlay}>
        <CoordinateDisplay />
      </div>
    </>
  );
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
