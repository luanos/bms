import prisma from "./client";

export function getVisibleWaypoints(userId: string) {
  return prisma.waypoint.findMany({
    include: {
      owner: {
        select: {
          username: true,
        },
      },
      visibleTo: {
        select: {
          username: true,
        },
      },
    },
    orderBy: {
      name: "asc",
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
