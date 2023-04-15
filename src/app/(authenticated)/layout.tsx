import { redirect } from "next/navigation";
import { ReactNode } from "react";

import { DebugMap } from "~/components/DebugMap";
import { getSession } from "~/session";
import { AppStoreProvider } from "~/state";
import { getVisibleWaypoints } from "~/waypoints";

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
      {children}
      <DebugMap />
    </AppStoreProvider>
  );
}
