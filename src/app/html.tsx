"use client";
import clsx from "clsx";
import { Lato } from "next/font/google";

import { useColorScheme } from "~/client/useColorScheme";
const lato = Lato({
  weight: ["100", "300", "400", "700", "900"],
  subsets: ["latin"],
});
export const ClientHTML = (props: any) => {
  const theme = useColorScheme();
  return (
    <html
      className={clsx(lato.className, theme === "dark" && "dark-theme")}
      lang="en"
      {...props}
    />
  );
};
