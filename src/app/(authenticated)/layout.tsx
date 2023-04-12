import { redirect } from "next/navigation";
import { ReactNode } from "react";

import { getSession } from "~/session";

export default async function AuthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }
  return children;
}
