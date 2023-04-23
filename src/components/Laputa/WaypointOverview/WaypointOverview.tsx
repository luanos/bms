import { WorldType } from "@prisma/client";
import Fuse from "fuse.js";
import { useMemo, useRef, useState } from "react";

import s from "./WaypointOverview.module.scss";
import { WaypointForm } from "../WaypointForm";
import { WaypointList } from "../WaypointList";
import { persistedScroll } from "~/client/persistedScroll";
import { persistedState } from "~/client/persistedState";
import { useUser, useWaypointActions, useWaypoints } from "~/client/state";
import { useDebouncedValue } from "~/client/useDebouncedValue";
import * as Dialog from "~/components/BaseUI/Dialog";
import * as Tabs from "~/components/BaseUI/Tabs";
import { FilterList } from "~/components/FilterList";
import {
  EpSearch,
  EpClose,
  EpCompass,
  EpExpand,
  EpCirclePlus,
} from "~/components/Icons";
import { waypointTypeDisplayName, worldTypeDisplayName } from "~/displaynames";

import type { WaypointType } from "@prisma/client";
import type { User } from "~/types";

const useQuery = persistedState("");

export function WaypointOverview() {
  const [query, setQuery] = useQuery();
  const input = useRef<HTMLInputElement>(null);
  const [debouncedQuery] = useDebouncedValue(query, 300);

  return (
    <>
      <div className={s.searchInput} onClick={() => input.current?.focus()}>
        <input
          name="search"
          type="search"
          autoComplete="off"
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

const usePersistedSearchScroll = persistedScroll();

function WaypointSearch({ query }: WaypointSearchProps) {
  const ref = usePersistedSearchScroll<HTMLDivElement>();
  const waypoints = useWaypoints();
  const fuseInstance = useMemo(() => {
    return new Fuse(waypoints, {
      keys: ["name", "owner.username"],
      includeMatches: true,
      useExtendedSearch: true,
    });
  }, [waypoints]);
  const shownWaypoints = useMemo(() => {
    return fuseInstance.search(query);
  }, [fuseInstance, query]);

  return (
    <>
      <div className={s.resultCount}>
        {shownWaypoints.length > 1
          ? `${shownWaypoints.length} Ergebnisse`
          : shownWaypoints.length == 1
          ? "1 Ergebnis"
          : "Keine Ergebnisse"}
      </div>
      <WaypointList waypoints={shownWaypoints} type="SEARCH" ref={ref} />
    </>
  );
}

const useActiveTab = persistedState<"CLOSED" | "EXPLORE" | "MY_WAYPOINTS">(
  "CLOSED"
);

function WaypointTabs() {
  const [activeTab, setActiveTab] = useActiveTab();
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

const useActiveFilter = persistedState<FilterValue>("ALL");
const usePersistedExploreScroll = persistedScroll();

function TabExplore() {
  const waypoints = useWaypoints();
  const ref = usePersistedExploreScroll<HTMLDivElement>();
  const [activeFilter, setActiveFilter] = useActiveFilter();
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

      <WaypointList type="EXPLORE" waypoints={displayedWaypoints} ref={ref} />
    </>
  );
}

const usePersistedMyWaypontsScroll = persistedScroll();

function TabMyWaypoints() {
  const waypoints = useWaypoints();
  const ref = usePersistedMyWaypontsScroll<HTMLDivElement>();
  const { user } = useUser();
  const ownWaypoints = waypoints.filter(
    (waypoint) => user.id === waypoint.owner.id
  );
  
  return (
    <>
      <div className={s.buttonAddWrapper}>
        <WaypointForm>
          <button className={s.buttonAdd}>
            <EpCirclePlus />
            Erstellen
          </button>
        </WaypointForm>
      </div>
      <WaypointList waypoints={ownWaypoints} ref={ref} type="MY_WAYPOINTS" />
    </>
  );
}
