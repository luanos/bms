import { useEffect, useRef, useState } from "react";

import s from "./Laputa.module.scss";
import { WaypointListEntry } from "./WaypointListEntry/WaypointListEntry";
import { EpSearch, EpClose, EpCompass, EpExpand } from "../Icons";
import * as Tabs from "~/components/BaseUI/Tabs";
import { useUser, useWaypointUtils, useWaypoints } from "~/state";

/** Debouncer for search query */
function useDebouncedValue<T = any>(
  value: T,
  wait: number,
  options = { leading: false }
) {
  const [_value, setValue] = useState(value);
  const mountedRef = useRef(false);
  const timeoutRef = useRef<any>(null);
  const cooldownRef = useRef(false);

  const cancel = () => window.clearTimeout(timeoutRef.current);

  useEffect(() => {
    if (mountedRef.current) {
      if (!cooldownRef.current && options.leading) {
        cooldownRef.current = true;
        setValue(value);
      } else {
        cancel();
        timeoutRef.current = window.setTimeout(() => {
          cooldownRef.current = false;
          setValue(value);
        }, wait);
      }
    }
  }, [value, options.leading, wait]);

  useEffect(() => {
    mountedRef.current = true;
    return cancel;
  }, []);

  return [_value, cancel] as const;
}

export function Laputa() {
  // State activeTab: Manages which Tab is currently active

  // State query: Contains search query from input[type=search]
  const [query, setQuery] = useState("");

  const [debounced] = useDebouncedValue(query, 200);
  const input = useRef<HTMLInputElement>(null);

  return (
    <div className={s.root}>
      <div className={s.searchInput} onClick={() => input.current?.focus()}>
        <input
          type="search"
          ref={input}
          onChange={(e) => setQuery(e.target.value)}
          value={query}
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
      <Idkyet />
      {debounced}
    </div>
  );
}

function SearchResults() {
  return <div></div>;
}

function Idkyet() {
  return (
    <Tabs.Root>
      <Tabs.List style={{ padding: "0 .25rem" }}>
        <Tabs.Trigger label="Entdecken" icon={<EpCompass />} value="0" />
        <Tabs.Trigger label="Meine Wegpunkte" icon={<EpExpand />} value="1" />
      </Tabs.List>
      <Tabs.Content value="0">
        <TabExplore />
      </Tabs.Content>
      <Tabs.Content value="1">
        <TabMyWaypoints />
      </Tabs.Content>
    </Tabs.Root>
  );
}

function TabExplore() {
  const waypoints = useWaypoints();
  const { user } = useUser();
  const otherWaypoints = waypoints.filter(
    (waypoint) => user.id === waypoint.owner.id
  );
  return <div>b</div>;
}

function TabMyWaypoints() {
  const waypoints = useWaypoints();
  const { user } = useUser();
  const { deleteWaypoint, addWaypoint } = useWaypointUtils();
  const ownWaypoints = waypoints.filter(
    (waypoint) => user.id === waypoint.owner.id
  );
  return (
    <div>
      {waypoints.map((wp) => (
        <WaypointListEntry waypoint={wp} key={wp.id} />
      ))}
      <button
        onClick={() =>
          addWaypoint({
            name: "asd",
            worldType: "OVERWORLD",
            visibility: "ALL",
            visibleTo: [],
            xCoord: 0,
            yCoord: 0,
            zCoord: 0,
            waypointType: "PRIVATE_BUILDING",
          })
        }
      >
        AddWP
      </button>
    </div>
  );
}
