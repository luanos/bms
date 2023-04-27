"use client";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import s from "./DebugMap.module.scss";
import { useMapHandle } from "../../client/state";

import type { Map } from "../../client/state";
import type { WorldType } from "@prisma/client";

interface Event {
  timestamp: Date;
  type: string;
  info: string;
}

function useHistory<T>(history: number = 50) {
  const [events, setEvents] = useState<T[]>([]);
  const pushEvent = useCallback(
    (event: T) => {
      setEvents((value) => {
        const lastEvents = value.slice(-history);
        return [...lastEvents, event];
      });
    },
    [history]
  );

  return [events, pushEvent] as const;
}

export function DebugMap() {
  const { registerMap, setLocation, unregisterMap } = useMapHandle();
  const [events, pushEvent] = useHistory<Event>();
  useEffect(() => {
    const map: Map = {
      panToLocation(...args) {
        pushEvent({
          timestamp: new Date(),
          type: "PAN_TO_LOCATION",
          info: args.toString(),
        });
      },
      updateHash: function (): void {
        throw new Error("Function not implemented.");
      },
      switchCurrentWorld: function (world: WorldType): void {
        throw new Error("Function not implemented.");
      },
    };

    registerMap(map);

    return () => unregisterMap();
  }, [pushEvent, registerMap, unregisterMap]);

  return (
    <div
      className={s.root}
      onMouseMove={(e) => {
        const { left, top } = e.currentTarget.getBoundingClientRect();
        setLocation(Math.round(e.clientX - left), Math.round(e.clientY - top));
      }}
    >
      <Image src="/map2.jpg" fill alt="" />
      {events.map((event) => (
        <pre
          key={event.timestamp.getMilliseconds()}
        >{`[${event.timestamp.toLocaleString("en")}] ${event.type}: ${
          event.info
        }`}</pre>
      ))}
    </div>
  );
}
