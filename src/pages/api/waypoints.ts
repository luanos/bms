import { authenticated } from "~/session";
import { WayppintAddInput } from "~/types";
import { createWaypoint, getVisibleWaypoints } from "~/waypoints";

export default authenticated(async (req, res, user) => {
  if (req.method === "GET") {
    return res.status(200).send(await getVisibleWaypoints(user.id));
  }

  if (req.method === "POST") {
    let parseResult = WayppintAddInput.safeParse(JSON.parse(req.body));

    if (!parseResult.success) {
      return res
        .status(400)
        .send({ status: "error", message: "Bad user input" });
    }
    await createWaypoint(user.id, parseResult.data);

    return res.status(200).send(await getVisibleWaypoints(user.id));
  }

  return res.status(404).send({ status: "error", message: "Unknown method" });
});
