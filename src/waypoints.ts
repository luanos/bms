import prisma from "./client";
import { Waypoint, WaypointAddInput, WaypointUpdateInput } from "./types";

export function updateWaypoint(
  waypointId: string,
  { visibleTo, ...input }: WaypointUpdateInput
) {
  return prisma.waypoint.update({
    where: { id: waypointId },
    data: {
      ...input,
      // possible bug: what if visibleTo input is undefined? does it reset the field to [] or not do anything?
      visibleTo: { connect: visibleTo?.map((userId) => ({ id: userId })) },
    },
  });
}

export function createWaypoint(
  ownerId: string,
  { visibleTo, ...input }: WaypointAddInput
) {
  return prisma.waypoint.create({
    data: {
      ...input,
      owner: { connect: { id: ownerId } },
      visibleTo: { connect: visibleTo.map((userId) => ({ id: userId })) },
    },
  });
}

export function deleteWaypoint(waypointId: string) {
  return prisma.waypoint.delete({ where: { id: waypointId } });
}

export function getVisibleWaypoints(userId: string): Promise<Waypoint[]> {
  return prisma.waypoint.findMany({
    select: {
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
