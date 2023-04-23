import { redirect } from "next/navigation";

import { AppStoreProvider } from "~/client/state";
import { DebugMap } from "~/components/DebugMap";
import prisma from "~/server/db";
import { getSession } from "~/server/session";
import { getVisibleWaypoints } from "~/server/waypoints";

import type { ReactNode } from "react";

export default async function AuthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }

  const users = await prisma.user.findMany({
    where: { NOT: { id: session.user.id } },
  });
  const waypoints = await getVisibleWaypoints(session.user.id);

  return (
    <AppStoreProvider
      user={session.user}
      allUsers={users}
      waypoints={JSON.parse(JSON.stringify(waypoints))}
    >
      <DebugMap />
      {children}
    </AppStoreProvider>
  );
}
