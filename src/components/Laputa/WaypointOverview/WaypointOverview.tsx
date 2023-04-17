import { WaypointType } from "@prisma/client";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { useEffect, useMemo, useRef, useState } from "react";

import s from "./WaypointOverview.module.scss";
import { WaypointList } from "../WaypointList";
import { useUser, useWaypointActions, useWaypoints } from "~/client/state";
import { useDebouncedValue } from "~/client/useDebouncedValue";
import * as Tabs from "~/components/BaseUI/Tabs";
import * as ToggleGroup from "~/components/BaseUI/ToggleGroup";
import {
  EpSearch,
  EpClose,
  EpCompass,
  EpExpand,
  EpCirclePlus,
  EpArrowRightBold,
} from "~/components/Icons";
import { waypointTypeDisplayName } from "~/displaynames";
import { Waypoint } from "~/types";

export function WaypointOverview() {
  const [query, setQuery] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const [debouncedQuery] = useDebouncedValue(query, 300);

  return (
    <>
      <div className={s.searchInput} onClick={() => input.current?.focus()}>
        <input
          name="search"
          type="search"
          ref={input}
          onChange={(e) => setQuery(e.target.value)}
          value={query}
          aria-label="Suche"
        />
        {query.length == 0 ? (
          <EpSearch
            onClick={() => {
              input.current?.focus();
            }}
          />
        ) : (
          <EpClose
            onClick={() => {
              setQuery("");
              input.current?.focus();
            }}
          />
        )}
      </div>
      {query && debouncedQuery ? (
        <WaypointSearch query={debouncedQuery} />
      ) : (
        <WaypointTabs />
      )}
    </>
  );
}

interface WaypointSearchProps {
  query: string;
}

function WaypointSearch({ query }: WaypointSearchProps) {
  const waypoints = useWaypoints();
  // TODO: provisorischen filter durch richtigen filter ersetzen
  const shownWaypoints = waypoints.filter((wp) => wp.name.includes(query));

  return (
    <>
      {shownWaypoints.length > 0
        ? `${shownWaypoints.length} results`
        : "no results"}
      <WaypointList waypoints={shownWaypoints} type="EXPLORE" />
    </>
  );
}

function WaypointTabs() {
  const [activeTab, setActiveTab] = useState<
    "CLOSED" | "EXPLORE" | "MY_WAYPOINTS"
  >();
  return (
    <Tabs.Root activationMode="manual" value={activeTab} className={s.tabRoot}>
      <Tabs.List
        style={{
          padding: "0 .25rem",
          ...(activeTab == "CLOSED" && { border: "none" }),
        }}
      >
        <Tabs.Trigger
          onClick={(e) => {
            setActiveTab((v) => (v == "EXPLORE" ? "CLOSED" : "EXPLORE"));
            e.currentTarget.blur();
          }}
          label="Entdecken"
          icon={<EpCompass />}
          value="EXPLORE"
        />
        <Tabs.Trigger
          onClick={(e) => {
            setActiveTab((v) =>
              v == "MY_WAYPOINTS" ? "CLOSED" : "MY_WAYPOINTS"
            );
            e.currentTarget.blur();
          }}
          label="Meine Wegpunkte"
          icon={<EpExpand />}
          value="MY_WAYPOINTS"
        />
      </Tabs.List>
      <Tabs.Content value="EXPLORE" className={s.tabContent}>
        <TabExplore />
      </Tabs.Content>
      <Tabs.Content value="MY_WAYPOINTS" className={s.tabContent}>
        <TabMyWaypoints />
      </Tabs.Content>
    </Tabs.Root>
  );
}

function TabExplore() {
  const waypoints = useWaypoints();
  const [activeFilter, setActiveFilter] = useState<WaypointType | "ALL">("ALL");
  const toggleGroupRef = useRef<HTMLDivElement>(null);
  // das muss doch einfacher gehen...
  const [scrollLeft, setScrollLeft] = useState(0);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!toggleGroupRef.current) return;
    const element = toggleGroupRef.current;
    setWidth(element.scrollWidth);
    let handleScroll = () => {
      setScrollLeft(element.scrollLeft);
    };

    element.addEventListener("scroll", handleScroll);
    return () => element.removeEventListener("scroll", handleScroll);
  }, []);

  const [availableFilters, displayedWaypoints] = useMemo(() => {
    const [filtersSet, displayedWaypoints] = waypoints.reduce<
      [Set<WaypointType>, Waypoint[]]
    >(
      ([set, waypoints], waypoint) => {
        set.add(waypoint.waypointType);
        if (activeFilter === "ALL" || waypoint.waypointType === activeFilter) {
          waypoints.push(waypoint);
        }
        return [set, waypoints];
      },
      [new Set(), []]
    );

    return [Array.from(filtersSet), displayedWaypoints];
  }, [activeFilter, waypoints]);

  return (
    <>
      <ToggleGroup.Root
        className={s.filterList}
        ref={toggleGroupRef}
        type="single"
        value={activeFilter}
        onValueChange={(value) =>
          value && setActiveFilter(value as WaypointType)
        }
        style={{
          padding: "0.5rem .75rem 0.5rem",
        }}
      >
        <ToggleGroup.Item value="ALL">Alle</ToggleGroup.Item>

        {availableFilters.map((type) => (
          <ToggleGroup.Item value={type} key={type}>
            {waypointTypeDisplayName[type as WaypointType]}
          </ToggleGroup.Item>
        ))}
        <button
          className={s.chevronLeft}
          data-visible={scrollLeft > 1}
          onClick={() => {
            toggleGroupRef.current?.scrollBy({
              left: -225,
              behavior: "smooth",
            });
          }}
          aria-label="Filter-Optionen nach links scrollen"
        >
          <EpArrowRightBold />
        </button>
        <button
          className={s.chevronRight}
          data-visible={width - scrollLeft - 400 > 1}
          onClick={() => {
            toggleGroupRef.current?.scrollBy({
              left: 225,
              behavior: "smooth",
            });
          }}
          aria-label="Filter-Optionen nach rechts scrollen"
        >
          <EpArrowRightBold />
        </button>
      </ToggleGroup.Root>

      <WaypointList type="EXPLORE" waypoints={displayedWaypoints} />
    </>
  );
}

function TabMyWaypoints() {
  const waypoints = useWaypoints();
  const { addWaypoint } = useWaypointActions();
  const { user } = useUser();
  const ownWaypoints = waypoints.filter(
    (waypoint) => user.id === waypoint.owner.id
  );
  return (
    <>
      <div className={s.buttonAddWrapper}>
        <button
          className={s.buttonAdd}
          onClick={() => {
            addWaypoint({
              name: "Netherportal",
              waypointType: "PORTAL",
              worldType: "OVERWORLD",
              visibility: "ALL",
              xCoord: 0,
              yCoord: 0,
              zCoord: 0,
              visibleTo: [],
            });
          }}
        >
          <EpCirclePlus />
          Erstellen
        </button>
      </div>
      <WaypointList waypoints={ownWaypoints} type="MY_WAYPOINTS" />
    </>
  );
}
