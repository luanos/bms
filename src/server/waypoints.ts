import Manager from "./RealTimeManager";
import prisma from "./db";

import type { Waypoint, WaypointAddInput, WaypointUpdateInput } from "../types";

const WaypointSelect = {
  id: true,
  name: true,
  xCoord: true,
  yCoord: true,
  description: true,
  zCoord: true,
  worldType: true,
  waypointType: true,
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
  updatedAt: true,
  createdAt: true,
};

export async function updateWaypoint(
  waypointId: string,
  { visibleTo, ...input }: WaypointUpdateInput
) {
  const oldWP = await prisma.waypoint
    .findFirst({
      select: WaypointSelect,
      where: { id: waypointId },
    })
    .then(maybeSerializeWaypoint);

  const newWP = await prisma.waypoint
    .update({
      select: WaypointSelect,
      where: { id: waypointId },
      data: {
        ...input,
        visibleTo: { connect: visibleTo?.map((userId) => ({ id: userId })) },
      },
    })
    .then(serializeWaypoint);

  Manager.handleUpdateWaypoint(oldWP!, newWP);

  return newWP;
}

export async function createWaypoint(
  ownerId: string,
  { visibleTo, ...input }: WaypointAddInput
) {
  let waypoint = await prisma.waypoint
    .create({
      select: WaypointSelect,
      data: {
        ...input,
        owner: { connect: { id: ownerId } },
        visibleTo: { connect: visibleTo.map((userId) => ({ id: userId })) },
      },
    })
    .then(serializeWaypoint);
  Manager.handleCreateWaypoint(waypoint);
  return waypoint;
}

export async function deleteWaypoint(waypointId: string) {
  let waypoint = await prisma.waypoint
    .findFirst({
      select: WaypointSelect,
      where: { id: waypointId },
    })
    .then(maybeSerializeWaypoint);
  Manager.handleDeleteWaypoint(waypoint!);
  return prisma.waypoint.delete({
    select: WaypointSelect,
    where: { id: waypointId },
  });
}

export async function getVisibleWaypoints(userId: string): Promise<Waypoint[]> {
  return prisma.waypoint
    .findMany({
      select: WaypointSelect,
      orderBy: {
        updatedAt: "desc",
      },
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
    })
    .then((waypoints) => waypoints.map(serializeWaypoint));
}

export async function checkWaypoint(
  userId: string,
  waypointId: string
): Promise<"OK" | "UNAUTHORIZED" | "NOT_FOUND"> {
  let waypoint = await prisma.waypoint.findFirst({ where: { id: waypointId } });
  if (!waypoint) return "NOT_FOUND";
  return userId === waypoint?.ownerId ? "OK" : "UNAUTHORIZED";
}
function serializeWaypoint<T extends { updatedAt: Date; createdAt: Date }>({
  updatedAt,
  createdAt,
  ...waypoint
}: T) {
  return {
    ...waypoint,
    updatedAt: updatedAt.toString(),
    createdAt: createdAt.toString(),
  };
}

function maybeSerializeWaypoint<T extends { updatedAt: Date; createdAt: Date }>(
  waypoint: T | null
) {
  return waypoint ? serializeWaypoint(waypoint) : null;
}
