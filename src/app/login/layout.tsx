import { redirect } from "next/navigation";

import { getSession } from "~/server/session";

import type { ReactNode } from "react";

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
