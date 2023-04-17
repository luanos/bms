import Fuse from "fuse.js";
import { atom, useAtom } from "jotai";
import { useMemo, useRef } from "react";

import s from "./WaypointOverview.module.scss";
import { WaypointList } from "../WaypointList";
import { useUser, useWaypointActions, useWaypoints } from "~/client/state";
import { useDebouncedValue } from "~/client/useDebouncedValue";
import * as Tabs from "~/components/BaseUI/Tabs";
import { FilterList } from "~/components/FilterList";
import {
  EpSearch,
  EpClose,
  EpCompass,
  EpExpand,
  EpCirclePlus,
} from "~/components/Icons";
import { waypointTypeDisplayName } from "~/displaynames";

import type { WaypointType } from "@prisma/client";

const queryAtom = atom("");

export function WaypointOverview() {
  const [query, setQuery] = useAtom(queryAtom);
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
  const fuseInstance = useMemo(() => {
    return new Fuse(waypoints, {
      keys: ["name", "owner.username"],
      includeMatches: true,
    });
  }, [waypoints]);
  const shownWaypoints = useMemo(() => {
    return fuseInstance.search(query);
  }, [fuseInstance, query]);

  return (
    <>
      {shownWaypoints.length > 0
        ? `${shownWaypoints.length} results`
        : "no results"}
      <WaypointList waypoints={shownWaypoints} type="SEARCH" />
    </>
  );
}

const tabAtom = atom<"CLOSED" | "EXPLORE" | "MY_WAYPOINTS">("CLOSED");

function WaypointTabs() {
  const [activeTab, setActiveTab] = useAtom(tabAtom);
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

type FilterValue = WaypointType | "ALL";

const activeFilterAtom = atom<FilterValue>("ALL");

function TabExplore() {
  const waypoints = useWaypoints();
  const [activeFilter, setActiveFilter] = useAtom(activeFilterAtom);
  // TODO: possible bug, what happens when a filter gets removed via rt and is
  // still selected via activeFilter?
  const availableFilters = useMemo(() => {
    const availableFilterValues: FilterValue[] = ["ALL"];
    waypoints.forEach((waypoint) =>
      availableFilterValues.push(waypoint.waypointType)
    );
    //
    return Array.from(new Set(availableFilterValues)).map((value) => ({
      value: value,
      display: value == "ALL" ? "Alle" : waypointTypeDisplayName[value],
    }));
  }, [waypoints]);

  const displayedWaypoints = waypoints.filter(
    (waypoint) => activeFilter == "ALL" || waypoint.waypointType == activeFilter
  );

  return (
    <>
      <FilterList
        filters={availableFilters}
        activeFilter={activeFilter}
        onFilterChange={(filter) =>
          filter && setActiveFilter(filter as FilterValue)
        }
      />

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
