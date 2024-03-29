import type { NextApiResponse } from "next";
import type { User, Waypoint } from "~/types";

interface WaypointHideMessage {
  type: "WAYPOINT_HIDE";
  // waypoint id
  data: string;
}

interface WaypointShowMessage {
  type: "WAYPOINT_SHOW";
  data: Waypoint;
}

interface WaypointUpdateMessage {
  type: "WAYPOINT_UPDATE";
  data: Waypoint;
}

interface ServerStatusMessage {
  type: "SERVER_STATUS";
  data: ServerStatus | null;
}

export type Message =
  | WaypointHideMessage
  | WaypointShowMessage
  | WaypointUpdateMessage
  | ServerStatusMessage;

export type ServerStatus = {
  state: "online" | "offline";
  currentPlayers: Set<string>;
};

function compareStatus(lhs: ServerStatus | null, rhs: ServerStatus | null) {
  if (!lhs || !rhs) return false;
  return (
    // state is equal
    lhs.state === rhs.state &&
    // currentPlayers are equal
    lhs.currentPlayers.size === rhs.currentPlayers.size &&
    Array.from(lhs.currentPlayers).every((player) =>
      rhs.currentPlayers.has(player)
    )
  );
}

/**
 * The RealTimeManager contains business logic to dispatch real-time events such
 * as
 *
 *   - waypoint creations, deletions, updates
 *   - minecraft server status changes
 *
 * the correct subset of connected clients
 */
class RealTimeManager {
  clients: Set<Client> = new Set();
  serverStatus: ServerStatus | null = null;
  // Timer for resetting the status to offline
  timeoutId: NodeJS.Timeout | null = null;
  constructor() {}

  addClient(client: Client) {
    this.clients.add(client);
    client.send({ type: "SERVER_STATUS", data: this.serverStatus });
    client.response.on("close", () => {
      this.clients.delete(client);
      client.response.end();
    });
  }

  setStatus(status: ServerStatus) {
    // compare status and send message if new state is different
    let isNewStatus = compareStatus(this.serverStatus, status);
    if (isNewStatus || !this.serverStatus) {
      this.clients.forEach((client) =>
        client.send({ type: "SERVER_STATUS", data: this.serverStatus })
      );
      this.serverStatus = status;
    }

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.timeoutId = setTimeout(
      () => this.setStatus({ state: "offline", currentPlayers: new Set() }),
      // MC server should ping every 10s. If no update happens in 20s,
      // update the status to "offline".
      +(process.env.SERVER_STATUS_TIMEOUT ?? 20000)
    );
  }

  handleCreateWaypoint(waypoint: Waypoint) {
    const message: Message = {
      type: "WAYPOINT_SHOW",
      data: waypoint,
    };

    this.clients.forEach((client) => {
      switch (waypoint.visibility) {
        case "ALL":
          // send message to every client
          client.send(message);
          break;
        case "PRIVATE":
          // send hide message to owners only
          if (client.user.id == waypoint.owner.id) {
            client.send(message);
          }
          break;
        case "SELECT":
          if (
            // send hide message to owners
            client.user.id == waypoint.owner.id ||
            // and users for which the waypoint is visible
            waypoint.visibleTo.some((user) => user.id == client.user.id)
          ) {
            client.send(message);
          }
          break;
      }
    });
  }

  handleUpdateWaypoint(oldWP: Waypoint, newWP: Waypoint) {
    if (oldWP.id !== newWP.id)
      throw new Error("the waypoints are not the same");

    this.clients.forEach((client) => {
      // 4 cases to consider:
      //   1. visible -> visible
      //   2. visible -> not visible
      //   3. not visible -> visible
      //   4. not visible -> not visible

      if (checkVisibility(oldWP, client.user)) {
        if (checkVisibility(newWP, client.user)) {
          // 1. visible -> visible
          client.send({ type: "WAYPOINT_UPDATE", data: newWP });
        } else {
          // 2. visible -> not visible
          client.send({ type: "WAYPOINT_HIDE", data: newWP.id });
        }
      } else {
        if (checkVisibility(newWP, client.user)) {
          // 3. not visible -> visible
          client.send({ type: "WAYPOINT_SHOW", data: newWP });
        } else {
          // 4. not visible -> not visible
          // do nothing
        }
      }
    });
  }

  handleDeleteWaypoint(waypoint: Waypoint) {
    const message: Message = {
      type: "WAYPOINT_HIDE",
      data: waypoint.id,
    };
    this.clients.forEach((client) => {
      switch (waypoint.visibility) {
        case "ALL":
          // send message to every client
          client.send(message);
          break;

        case "PRIVATE":
          // send hide message to owners only
          if (client.user.id == waypoint.owner.id) {
            client.send(message);
          }
          break;

        case "SELECT":
          if (
            // send hide message to owners
            client.user.id == waypoint.owner.id ||
            // and users for which the waypoint was visible
            waypoint.visibleTo.some((user) => user.id == client.user.id)
          ) {
            client.send(message);
          }
          break;
      }
    });
  }
}

export class Client {
  constructor(public response: NextApiResponse, public user: User) {
    response.setHeader("Content-Type", "text/event-stream");
    response.setHeader("Cache-Control", "no-cache, no-transform");
    response.setHeader("Connection", "keep-alive");
    response.setHeader("Content-Encoding", "none");

    // 15s keep alive
    setInterval(() => this.response.write(":\n\n"), 15000);
    this.response.write(":\n\n");
  }

  send(message: Message) {
    this.response.write(`data: ${JSON.stringify(message)}\n\n`);
  }
}

// util fn
function checkVisibility(waypoint: Waypoint, user: User): boolean {
  switch (waypoint.visibility) {
    case "ALL":
      return true;
    case "PRIVATE":
      return waypoint.owner.id === user.id;
    case "SELECT":
      // either user is owner or in visibility list
      return (
        waypoint.owner.id === user.id ||
        waypoint.visibleTo.some((seeingUser) => seeingUser.id === user.id)
      );
  }
}

// singleton instance management
const globalForManager = global as unknown as {
  manager: RealTimeManager | undefined;
};
// const Manager = new RealTimeManager();
const getManager = () => {
  if (globalForManager.manager) return globalForManager.manager;
  console.debug("[debug] Creating first manager");
  const manager = new RealTimeManager();
  globalForManager.manager = manager;
  return manager;
};
const Manager = getManager();
export default Manager;
