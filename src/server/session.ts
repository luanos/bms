import { IronSession, IronSessionOptions, unsealData } from "iron-session";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { cookies } from "next/headers";

import { User } from "../types";

if (!process.env.COOKIE_SECRET) {
  throw new Error("Cookie secret not set");
}

declare module "iron-session" {
  interface IronSessionData {
    user?: User;
  }
}

export function authenticated(
  handler: (
    req: NextApiRequest,
    res: NextApiResponse,
    user: User
  ) => unknown | Promise<unknown>,
  method?: string
) {
  let authenticatedHandler: NextApiHandler = (req, res) => {
    if (!req.session.user) {
      res
        .status(401)
        .send({ status: "error", message: "Unauthenticated access" });
      return;
    }
    if (method && method !== req.method) {
      res.status(400).send({ status: "error", message: "unknown method" });
    }
    return handler(req, res, req.session.user);
  };

  return withIronSessionApiRoute(authenticatedHandler, sessionConfig);
}

export function withSession(handler: NextApiHandler) {
  return withIronSessionApiRoute(handler, sessionConfig);
}

export async function getSession() {
  const cookie = cookies().get(sessionConfig.cookieName);
  if (!cookie) return null;

  const session = await unsealData(cookie.value, sessionConfig);
  return session as unknown as IronSession;
}

export async function getUser() {
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Accessed User without session");
  }

  return session.user;
}

export const sessionConfig: IronSessionOptions = {
  cookieName: "session",
  password: process.env.COOKIE_SECRET,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};
