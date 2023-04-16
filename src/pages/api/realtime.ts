import Manager, { Client } from "~/server/RealTimeManager";
import { authenticated } from "~/server/session";

export default authenticated(async (req, res, user) => {
  const client = new Client(res, user);

  Manager.addClient(client);
});
