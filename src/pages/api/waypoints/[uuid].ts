import { authenticated } from "~/server/session";
import {
  checkWaypoint,
  deleteWaypoint,
  getVisibleWaypoints,
  updateWaypoint,
} from "~/server/waypoints";
import { WaypointUpdateInput } from "~/types";

export default authenticated(async (req, res, user) => {
  // Query structure is given by file path
  const { uuid } = req.query as { uuid: string };
  let result = await checkWaypoint(user.id, uuid);
  if (result === "NOT_FOUND")
    return res.status(404).send({ status: "error", message: "Not found" });

  if (result === "UNAUTHORIZED")
    return res.status(403).send({ status: "error", message: "Forbidden" });

  if (req.method === "DELETE") {
    await deleteWaypoint(uuid);
    return res.status(200).send(await getVisibleWaypoints(user.id));
  }
  if (req.method === "PUT") {
    let parseResult = WaypointUpdateInput.safeParse(JSON.parse(req.body));

    if (!parseResult.success) {
      return res
        .status(400)
        .send({ status: "error", message: "Bad user input" });
    }
    await updateWaypoint(uuid, parseResult.data);
    return res.status(200).send(await getVisibleWaypoints(user.id));
  }
  res.status(400).send({ status: "error", message: "unknown method" });
});
