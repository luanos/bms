import { Suspense } from "react";

import s from "./Page.module.scss";
import { Map } from "~/components/Map";
import { SideBar } from "~/components/SideBar";

export default function Index() {
  return (
    <div className={s.wrapper}>
      <div className={s.mapWrapper}>
        <Map />
      </div>
      <div className={s.sideBarWrapper}>
        {/* @ts-expect-error Async Server Component */}
        <SideBar />
      </div>
    </div>
  );
}
