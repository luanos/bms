import { z } from "zod";

import prisma from "~/client";
import { authenticated } from "~/session";

let waypointAddInput = z.object({
  worldType: z.enum(["OVERWORLD", "NETHER", "END"]),
  visibility: z.enum(["ALL", "SELECT", "PRIVATE"]),
  name: z.string(),
  select: z.string().array().optional(),
  xCoord: z.number(),
  yCoord: z.number(),
  zCoord: z.number(),
});

export default authenticated(async (req, res, user) => {
  let parseResult = waypointAddInput.safeParse(JSON.parse(req.body));

  if (!parseResult.success) {
    res
      .status(400)
      .send({ status: "error", message: parseResult.error.message });
    return;
  }
  let { select, ...input } = parseResult.data;

  await prisma.waypoint.create({
    data: {
      ...input,
      owner: {
        connect: {
          id: user.id,
        },
      },
    },
  });

  res.status(200).send({ status: "success" });
  return;
}, "POST");
