import prisma from "./client";
import Manager from "./realtime/manager";
import { Waypoint, WaypointAddInput, WaypointUpdateInput } from "./types";

const WaypointSelect = {
  id: true,
  name: true,
  xCoord: true,
  yCoord: true,
  zCoord: true,
  worldType: true,
  owner: {
    select: {
      username: true,
      id: true,
    },
  },
  visibility: true,
  visibleTo: {
    select: {
      username: true,
      id: true,
    },
  },
};

export async function updateWaypoint(
  waypointId: string,
  { visibleTo, ...input }: WaypointUpdateInput
) {
  const oldWP = await prisma.waypoint.findFirst({
    select: WaypointSelect,
    where: { id: waypointId },
  });

  const newWP = await prisma.waypoint.update({
    select: WaypointSelect,
    where: { id: waypointId },
    data: {
      ...input,
      // possible bug: what if visibleTo input is undefined? does it reset the field to [] or not do anything?
      visibleTo: { connect: visibleTo?.map((userId) => ({ id: userId })) },
    },
  });

  Manager.handleUpdateWaypoint(oldWP!, newWP);

  return newWP;
}

export async function createWaypoint(
  ownerId: string,
  { visibleTo, ...input }: WaypointAddInput
) {
  let waypoint = await prisma.waypoint.create({
    select: WaypointSelect,
    data: {
      ...input,
      owner: { connect: { id: ownerId } },
      visibleTo: { connect: visibleTo.map((userId) => ({ id: userId })) },
    },
  });
  Manager.handleCreateWaypoint(waypoint);
  return waypoint;
}

export async function deleteWaypoint(waypointId: string) {
  let waypoint = await prisma.waypoint.findFirst({
    select: WaypointSelect,
    where: { id: waypointId },
  });
  Manager.handleDeleteWaypoint(waypoint!);
  return prisma.waypoint.delete({
    select: WaypointSelect,
    where: { id: waypointId },
  });
}

export function getVisibleWaypoints(userId: string): Promise<Waypoint[]> {
  return prisma.waypoint.findMany({
    select: WaypointSelect,

    where: {
      OR: [
        // own waypoints
        {
          AND: {
            ownerId: userId,
          },
        },
        // select rule waypoints
        {
          AND: {
            visibility: "SELECT",
            visibleTo: {
              some: {
                id: userId,
              },
            },
          },
        },
        // public waypoints
        {
          visibility: "ALL",
        },
      ],
    },
  });
}

export async function checkWaypoint(
  userId: string,
  waypointId: string
): Promise<"OK" | "UNAUTHORIZED" | "NOT_FOUND"> {
  let waypoint = await prisma.waypoint.findFirst({ where: { id: waypointId } });
  if (!waypoint) return "NOT_FOUND";
  return userId === waypoint?.ownerId ? "OK" : "UNAUTHORIZED";
}
