"use client";
import { useCallback, useEffect, useRef, useState } from "react";

import s from "./DebugMap.module.scss";
import { Map, useMapHandle } from "../../state";

interface Event {
  timestamp: Date;
  type: string;
  info: string;
}

function useHistory<T>(history: number = 10) {
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
  const { registerMap, updateLocation, unregisterMap } = useMapHandle();
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
    };

    registerMap(map);

    return () => unregisterMap();
  }, []);

  return (
    <div>
      {events.map((event) => (
        <pre
          key={event.timestamp.getMilliseconds()}
        >{`[${event.timestamp.toLocaleString("en")}] ${event.type}: ${
          event.info
        }`}</pre>
      ))}
      <div
        className={s.canvas}
        onMouseMove={(e) => {
          const { left, top } = e.currentTarget.getBoundingClientRect();
          updateLocation(
            Math.round(e.clientX - left),
            Math.round(e.clientY - top)
          );
        }}
      />
    </div>
  );
}
