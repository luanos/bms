import { Metadata } from "next";
import { Lato } from "next/font/google";

import "~/styles/main.scss";

const lato = Lato({
  weight: ["100", "300", "400", "700", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BMS Companion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className={lato.className} lang="en">
      <body>{children}</body>
    </html>
  );
}
