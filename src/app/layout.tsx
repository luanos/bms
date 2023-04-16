import { Metadata } from "next";
import { Lato } from "next/font/google";
import "~/styles/main.scss";

export const metadata: Metadata = {
  title: "BMS Companion",
};

const darkModeScript = `if(window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.classList.add("dark-theme")}`;

const lato = Lato({
  weight: ["100", "300", "400", "700", "900"],
  subsets: ["latin"],
});
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className={lato.className}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: darkModeScript }}></script>
        {children}
      </body>
    </html>
  );
}
