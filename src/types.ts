import { z } from "zod";

import type { Waypoint as DBWaypoint, User as DBUser } from "@prisma/client";

export type User = Omit<DBUser, "password">;

export type Waypoint = Omit<
  DBWaypoint,
  "ownerId" | "updatedAt" | "createdAt"
> & {
  owner: User;
  visibleTo: User[];
  updatedAt: string;
  createdAt: string;
};

export const WaypointUpdateInput = z.object({
  name: z.string().nonempty().optional(),
  description: z.string().optional(),
  worldType: z.enum(["OVERWORLD", "NETHER", "END"]).optional(),
  visibility: z.enum(["ALL", "SELECT", "PRIVATE"]).optional(),
  visibleTo: z.string().array().optional(),
  waypointType: z
    .enum([
      "PRIVATE_BUILDING",
      "PUBLIC_BUILDING",
      "PRIVATE_FARM",
      "PUBLIC_FARM",
      "PORTAL",
      "POINT_OF_INTEREST",
      "OTHER",
    ])
    .optional(),
  xCoord: z.number().optional(),
  yCoord: z.number().optional(),
  zCoord: z.number().optional(),
});

export type WaypointUpdateInput = z.infer<typeof WaypointUpdateInput>;

export const WaypointAddInput = z.object({
  name: z.string().nonempty(),
  description: z.string(),
  worldType: z.enum(["OVERWORLD", "NETHER", "END"]),
  visibility: z.enum(["ALL", "SELECT", "PRIVATE"]),
  visibleTo: z.string().array(),
  waypointType: z.enum([
    "PRIVATE_BUILDING",
    "PUBLIC_BUILDING",
    "PRIVATE_FARM",
    "PUBLIC_FARM",
    "PORTAL",
    "POINT_OF_INTEREST",
    "OTHER",
  ]),
  xCoord: z.number(),
  yCoord: z.number(),
  zCoord: z.number(),
});

export type WaypointAddInput = z.infer<typeof WaypointAddInput>;

export const LoginInput = z.object({
  username: z.string().nonempty(),
  password: z.string().nonempty(),
});

export type LoginInput = z.infer<typeof LoginInput>;
