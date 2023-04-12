import { z } from "zod";

import prisma from "~/client";
import { withSession } from "~/session";

let loginInput = z.object({
  username: z.string(),
  password: z.string(),
});

export default withSession(async (req, res) => {
  let parseResult = loginInput.safeParse(JSON.parse(req.body));
  if (!parseResult.success) {
    res.status(401).send({
      status: "error",
      message: "Benutzername oder Passwort falsch",
    });
    return;
  }
  let input = parseResult.data;

  let userMaybe = await prisma.user.findFirst({
    where: { username: input.username },
  });

  if (!userMaybe) {
    res.status(401).send({
      status: "error",
      message: "Benutzername oder Passwort falsch",
    });
    return;
  }

  const { password, ...user } = userMaybe;
  if (input.password === password) {
    req.session.user = user;

    await req.session.save();

    res.status(200).send({
      status: "success",
      message: "Login successful",
    });
    return;
  } else {
    res.status(401).send({
      status: "error",
      message: "Benutzername oder Passwort falsch",
    });
    return;
  }
});
