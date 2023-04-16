import { redirect } from "next/navigation";
import { ReactNode } from "react";

import { getSession } from "~/server/session";

export default async function UnauthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();
  if (session?.user) {
    redirect("/");
  }
  return children;
}
