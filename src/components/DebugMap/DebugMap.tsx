"use client";
import { useCallback, useEffect, useState } from "react";

import s from "./DebugMap.module.scss";
import { useMapHandle } from "../../client/state";

import type { Map } from "../../client/state";
import type { WorldType } from "@prisma/client";
import type { Message } from "~/server/RealTimeManager";

interface Event {
  timestamp: Date;
  data: EventData;
}

interface EventData {
  type: string;
  info: any;
}

function useHistory(history: number = 50) {
  const [events, setEvents] = useState<Event[]>([]);
  const pushEvent = useCallback(
    (data: EventData) => {
      const event = { timestamp: new Date(), data: data };
      console.log(event);
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
  const { registerMap, setLocation, unregisterMap, setCurrentWorld } =
    useMapHandle();
  const [events, pushEvent] = useHistory();
  useEffect(() => {
    const map: Map = {
      panToLocation(...args) {
        pushEvent({
          type: "PAN_TO_LOCATION",
          info: args.toString(),
        });
      },
      updateHash: function (): void {
        throw new Error("Function not implemented.");
      },
      switchCurrentWorld: function (world: WorldType): void {
        setCurrentWorld(world);
        pushEvent({ type: "SWITCH_CURRENT_WORLD", info: world });
      },
    };

    registerMap(map);

    return () => unregisterMap();
  }, [pushEvent, registerMap, unregisterMap, setCurrentWorld]);

  useEffect(() => {
    const eventSource = new EventSource("/api/realtime");
    eventSource.addEventListener("message", (incoming) => {
      const message: Message = JSON.parse(incoming.data);
      pushEvent({
        type: `(RT_IN) ${message.type}`,
        info: message.data,
      });
    });

    return () => eventSource.close();
  }, [pushEvent]);

  return (
    <div
      className={s.root}
      onMouseMove={(e) => {
        const { left, top } = e.currentTarget.getBoundingClientRect();
        setLocation(Math.round(e.clientX - left), Math.round(e.clientY - top));
      }}
    >
      {events.map((event) => (
        <pre
          key={event.timestamp.getMilliseconds()}
        >{`[${event.timestamp.toLocaleString("en")}] ${
          event.data.type
        }: ${JSON.stringify(event.data.info)}`}</pre>
      ))}
    </div>
  );
}
