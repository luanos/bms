import { withSession } from "~/session";

export default withSession(async (req, res) => {
  req.session.destroy();
  res.status(200).send({ status: "success" });
});
