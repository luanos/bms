import prisma from "~/server/db";
import { withSession } from "~/server/session";
import { LoginInput } from "~/types";

export default withSession(async (req, res) => {
  let parseResult = LoginInput.safeParse(JSON.parse(req.body));
  if (!parseResult.success) {
    return res.status(401).send({
      status: "error",
      message: "Benutzername oder Passwort falsch",
    });
  }
  let input = parseResult.data;

  let userMaybe = await prisma.user.findFirst({
    where: { username: input.username },
  });

  if (!userMaybe) {
    return res.status(401).send({
      status: "error",
      message: "Benutzername oder Passwort falsch",
    });
  }

  const { password, ...user } = userMaybe;
  if (input.password === password) {
    req.session.user = user;

    await req.session.save();

    return res.status(200).send({
      status: "success",
      message: "Login successful",
    });
  } else {
    return res.status(401).send({
      status: "error",
      message: "Benutzername oder Passwort falsch",
    });
  }
});
