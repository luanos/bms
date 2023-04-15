import { z } from "zod";
export type User = {
  username: string;
  id: string;
};

export type Waypoint = {
  id: string;
  name: string;
  owner: User;
  worldType: "OVERWORLD" | "NETHER" | "END";
  visibility: "ALL" | "SELECT" | "PRIVATE";
  visibleTo: User[];
  xCoord: number;
  yCoord: number;
  zCoord: number;
};

export const WaypointUpdateInput = z.object({
  name: z.string().nonempty().optional(),
  worldType: z.enum(["OVERWORLD", "NETHER", "END"]).optional(),
  visibility: z.enum(["ALL", "SELECT", "PRIVATE"]).optional(),
  visibleTo: z.string().array().optional(),
  xCoord: z.number().optional(),
  yCoord: z.number().optional(),
  zCoord: z.number().optional(),
});

export type WaypointUpdateInput = z.infer<typeof WaypointUpdateInput>;

export const WayppintAddInput = z.object({
  name: z.string().nonempty(),
  worldType: z.enum(["OVERWORLD", "NETHER", "END"]),
  visibility: z.enum(["ALL", "SELECT", "PRIVATE"]),
  visibleTo: z.string().array(),
  xCoord: z.number(),
  yCoord: z.number(),
  zCoord: z.number(),
});

export type WaypointAddInput = z.infer<typeof WayppintAddInput>;

export const LoginInput = z.object({
  username: z.string().nonempty(),
  password: z.string().nonempty(),
});

export type LoginInput = z.infer<typeof LoginInput>;
