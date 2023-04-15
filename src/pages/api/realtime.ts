import Manager, { Client } from "~/realtime/manager";
import { authenticated } from "~/session";

export default authenticated(async (req, res, user) => {
  const client = new Client(res, user);

  Manager.addClient(client);
});
