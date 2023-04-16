import { Metadata } from "next";

import "~/styles/main.scss";
import { ClientHTML } from "./html";

export const metadata: Metadata = {
  title: "BMS Companion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientHTML>
      <body>{children}</body>
    </ClientHTML>
  );
}
