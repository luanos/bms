import { z } from "zod";

import prisma from "~/client";
import { authenticated } from "~/session";

let waypointUpdateInput = z.object({
  worldType: z.enum(["OVERWORLD", "NETHER", "END"]),
  visibility: z.enum(["ALL", "SELECT", "PRIVATE"]),
  name: z.string(),
  select: z.string().array().optional(),
  xCoord: z.number(),
  yCoord: z.number(),
  zCoord: z.number(),
});

export default authenticated(async (req, res, user) => {
  // Query structure is given by file path
  const { uuid } = req.query as { uuid: string };

  let wp = await prisma.waypoint.findFirst({ where: { id: uuid } });
  if (!wp) {
    res.status(404).send({ status: "error", message: "waypoint not found" });
    return;
  }
  // Authorization check
  if (wp.ownerId !== user.id) {
    res.status(401).send({ status: "error", message: "unauthorized" });
    return;
  }

  if (req.method === "DELETE") {
    await prisma.waypoint.delete({ where: { id: uuid } });
    res.status(200).send({ status: "success" });
    return;
  }
  if (req.method === "PATCH") {
    let input;
    try {
      input = waypointUpdateInput.parse(JSON.parse(req.body));
    } catch {
      res.status(400).send({ status: "error" });
      return;
    }

    await prisma.waypoint.update({
      where: { id: uuid },
      data: input,
    });
    res.status(200).send({ status: "success" });
    return;
  }
  res.status(400).send({ status: "error", message: "unknown method" });
});
