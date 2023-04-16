import { redirect } from "next/navigation";
import { ReactNode } from "react";

import { AppStoreProvider } from "~/client/state";
import { DebugMap } from "~/components/DebugMap";
import { getSession } from "~/server/session";
import { getVisibleWaypoints } from "~/server/waypoints";

export default async function AuthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }

  const waypoints = await getVisibleWaypoints(session.user.id);

  return (
    <AppStoreProvider user={session.user} waypoints={waypoints}>
      <DebugMap />
      {children}
    </AppStoreProvider>
  );
}
