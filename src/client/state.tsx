"use client";
import { createContext, useContext, useEffect, useRef } from "react";
import { createStore, useStore } from "zustand";
import { shallow } from "zustand/shallow";

import { safeFetch } from "../utils";

import type { Message, ServerStatus } from "../server/RealTimeManager";
import type {
  User,
  Waypoint,
  WaypointAddInput,
  WaypointUpdateInput,
} from "../types";
import type { WorldType } from "@prisma/client";
import type { PropsWithChildren } from "react";
import type { StoreApi } from "zustand";

interface AppState {
  user: User;
  allUsers: User[];
  serverStatus: ServerStatus | null;
  waypoints: Waypoint[];
  // TODO: Possible Bug when focusedWaypointId is set but waypoint is getting
  // hidden. the id could then reference a waypoint not present above
  focusedWaypointId: string | null;
  map: Map | null;
  // Map States
  currentWorld: WorldType | null;
  location: {
    xPos: number;
    yPos: number;
  } | null;
}

export interface Map {
  updateHash(): void;
  switchCurrentWorld(world: WorldType): void;
  panToLocation(
    world: WorldType,
    xPos: number,
    yPos: number,
    zPos: number
  ): void;
}

interface AppContext extends AppState {
  // user related
  logout(): void;

  // map handles
  registerMap(map: Map): void;
  unregisterMap(): void;
  setCurrentWorld(worldType: WorldType): void;
  setLocation(xPos: number, yPos: number): void;

  // waypoint related
  addWaypoint(input: WaypointAddInput): Promise<void>;
  deleteWaypoint(waypointId: string): Promise<void>;
  focusWaypoint(waypointId: string): void;
  blurWaypoint(): void;
  updateWaypoint(waypointId: string, input: WaypointUpdateInput): Promise<void>;
}

type AppStore = StoreApi<AppContext>;

function createAppContextStore(
  user: User,
  allUsers: User[],
  waypoints: Waypoint[]
) {
  return createStore<AppContext>((set, get) => ({
    user,
    waypoints,
    allUsers,
    serverStatus: null,
    currentWorld: "OVERWORLD",
    map: null,
    focusedWaypointId: null,
    location: null,
    focusWaypoint(waypointId) {
      set({ focusedWaypointId: waypointId });
    },
    blurWaypoint() {
      set({ focusedWaypointId: null });
    },
    async addWaypoint(input) {
      let response: Waypoint[] = await safeFetch("/api/waypoints", {
        method: "POST",
        body: JSON.stringify(input),
      });
      set({ waypoints: response });
    },
    async deleteWaypoint(waypointId) {
      let response: Waypoint[] = await safeFetch(
        `/api/waypoints/${waypointId}`,
        {
          method: "DELETE",
        }
      );
      set({ waypoints: response });
    },
    async updateWaypoint(waypointId, input) {
      let response: Waypoint[] = await safeFetch(
        `/api/waypoints/${waypointId}`,
        { method: "PUT", body: JSON.stringify(input) }
      );
      set({ waypoints: response });
    },
    async logout() {
      await safeFetch("/api/auth/logout");
      window.location.href = "/login";
    },
    registerMap(map) {
      if (get().map) {
        throw new Error("Map already registered");
      }
      set({ map });
    },
    setCurrentWorld(worldType) {
      set({ currentWorld: worldType });
    },
    unregisterMap() {
      set({ map: null });
    },
    setLocation(xPos, yPos) {
      set({ location: { xPos, yPos } });
    },
  }));
}

const AppStoreContext = createContext<AppStore | null>(null);

// Base App Context Hook
function useAppContext<T>(
  selector: (state: AppContext) => T,
  equalityFn?: (lhs: T, rhs: T) => boolean
): T {
  const appStore = useContext(AppStoreContext);
  if (!appStore) throw new Error("Missing AppProvider in the tree");
  return useStore(appStore, selector, equalityFn);
}
interface AppProviderProps {
  user: User;
  allUsers: User[];
  waypoints: Waypoint[];
}

export function AppStoreProvider({
  user,
  waypoints,
  allUsers,
  children,
}: PropsWithChildren<AppProviderProps>) {
  const storeRef = useRef<StoreApi<AppContext>>();
  if (!storeRef.current) {
    storeRef.current = createAppContextStore(user, allUsers, waypoints);
  }

  useEffect(() => {
    const eventSource = new EventSource("/api/realtime");
    eventSource.addEventListener("message", (incoming) => {
      let message: Message = JSON.parse(incoming.data);
      if (message.type == "WAYPOINT_HIDE") {
        let waypointId = message.data;
        storeRef.current?.setState((app) => ({
          waypoints: app.waypoints.filter(
            (waypoint) => waypoint.id !== waypointId
          ),
        }));
      }
      if (message.type == "WAYPOINT_UPDATE") {
        let updatedWaypoint = message.data;
        storeRef.current?.setState((app) => ({
          waypoints: app.waypoints.map((waypoint) => {
            if (waypoint.id === updatedWaypoint.id) {
              return updatedWaypoint;
            }
            return waypoint;
          }),
        }));
      }
      if (message.type == "WAYPOINT_SHOW") {
        let waypoint = message.data;
        storeRef.current?.setState((app) => ({
          waypoints: [waypoint, ...app.waypoints],
        }));
      }
      if (message.type == "SERVER_STATUS") {
        let status = message.data;
        storeRef.current?.setState({ serverStatus: status });
      }
    });
    return () => eventSource.close();
  }, []);
  return (
    <AppStoreContext.Provider value={storeRef.current}>
      {children}
    </AppStoreContext.Provider>
  );
}

// Utility Functions

export function useUser() {
  return useAppContext(
    (app) => ({
      user: app.user,
      logout: app.logout,
    }),
    shallow
  );
}

export function useWaypoints() {
  return useAppContext((app) => app.waypoints);
}

export function useFocusedWaypoint() {
  return useAppContext(
    ({ waypoints, focusedWaypointId }) =>
      waypoints.find((waypoint) => waypoint.id === focusedWaypointId) ?? null
  );
}

export function useFocusedWaypointActions() {
  return useAppContext(
    ({ focusWaypoint, blurWaypoint }) => ({
      focusWaypoint,
      blurWaypoint,
    }),
    shallow
  );
}

export function useWaypointActions() {
  return useAppContext(
    ({ addWaypoint, deleteWaypoint, updateWaypoint }) => ({
      addWaypoint,
      deleteWaypoint,
      updateWaypoint,
    }),
    shallow
  );
}

export function useAllUsers() {
  return useAppContext((app) => app.allUsers);
}

export function useMap() {
  return useAppContext((app) => app.map);
}

export function useLocation() {
  return useAppContext((app) => app.location);
}

export function useServerStatus() {
  return useAppContext((app) => app.serverStatus);
}

export function useCurrentWorld() {
  return useAppContext(
    ({ map, currentWorld }) => ({
      switchCurrentWorld: map?.switchCurrentWorld,
      currentWorld,
    }),
    shallow
  );
}

export function useMapHandle() {
  return useAppContext(
    ({
      registerMap,
      setLocation,
      unregisterMap,
      setCurrentWorld,
      currentWorld,
    }) => ({
      registerMap,
      setCurrentWorld,
      unregisterMap,
      setLocation,
      currentWorld,
    }),
    shallow
  );
}
