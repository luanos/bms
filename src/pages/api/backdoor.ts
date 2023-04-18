import Manager from "~/server/RealTimeManager";

import type { NextApiRequest, NextApiResponse } from "next";

export default function Backdoor(req: NextApiRequest, res: NextApiResponse) {
  Manager.setState("online");
  res.status(200).end();
}
