"use client";
import { useEffect, useRef } from "react";

import s from "./BlueMap.module.scss";
import { BlueMapApp } from "~/vendor/bluemap/BlueMapApp";
export default function BlueMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!containerRef.current) return;

    const bluemap = new BlueMapApp(containerRef.current);
    bluemap.load();
  }, []);
  return <div className={s.root} ref={containerRef}></div>;
}
