"use client";

import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useRef,
} from "react";
import { StoreApi, createStore, useStore } from "zustand";
import { shallow } from "zustand/shallow";

import { Message } from "../server/RealTimeManager";
import {
  User,
  Waypoint,
  WaypointAddInput,
  WaypointUpdateInput,
} from "../types";
import { safeFetch } from "../utils";

interface AppState {
  user: User;
  waypoints: Waypoint[];
  map: Map | null;
  location: {
    xPos: number;
    yPos: number;
  } | null;
}

export interface Map {
  panToLocation(xPos: number, yPos: number, zPos: number): void;
}

interface AppContext extends AppState {
  // user related
  logout(): void;

  // map related
  updateLocation(xPos: number, yPos: number): void;
  registerMap(map: Map): void;
  unregisterMap(): void;

  // waypoint related
  addWaypoint(input: WaypointAddInput): Promise<void>;
  deleteWaypoint(waypointId: string): Promise<void>;
  updateWaypoint(waypointId: string, input: WaypointUpdateInput): Promise<void>;
}

type AppStore = StoreApi<AppContext>;

function createAppContextStore(user: User, waypoints: Waypoint[]) {
  return createStore<AppContext>((set, get) => ({
    user,
    waypoints,
    map: null,
    location: null,
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
    unregisterMap() {
      set({ map: null });
    },
    updateLocation(xPos, yPos) {
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
  waypoints: Waypoint[];
}

export function AppStoreProvider({
  user,
  waypoints,
  children,
}: PropsWithChildren<AppProviderProps>) {
  const storeRef = useRef<StoreApi<AppContext>>();
  if (!storeRef.current) {
    storeRef.current = createAppContextStore(user, waypoints);
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
      if (
        message.type == "WAYPOINT_SHOW" ||
        message.type == "WAYPOINT_UPDATE"
      ) {
        let waypoint = message.data;
        storeRef.current?.setState((app) => ({
          waypoints: [...app.waypoints, waypoint],
        }));
      }
    });
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

export function useWaypointUtils() {
  return useAppContext(
    ({ addWaypoint, deleteWaypoint, updateWaypoint }) => ({
      addWaypoint,
      deleteWaypoint,
      updateWaypoint,
    }),
    shallow
  );
}

export function useMap() {
  return useAppContext((app) => app.map);
}

export function useLocation() {
  return useAppContext((app) => app.location);
}

export function useMapHandle() {
  return useAppContext(
    ({ registerMap, updateLocation, unregisterMap }) => ({
      registerMap,
      unregisterMap,
      updateLocation,
    }),
    shallow
  );
}
