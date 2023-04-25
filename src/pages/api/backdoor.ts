import Manager from "~/server/RealTimeManager";

import type { NextApiRequest, NextApiResponse } from "next";

export default function Backdoor(req: NextApiRequest, res: NextApiResponse) {
  console.log(JSON.parse(req.body));
  Manager.setStatus({ state: "online", currentPlayers: new Set() });
  res.status(200).end();
}
