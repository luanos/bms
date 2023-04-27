import dynamic from "next/dynamic";

const BlueMap = dynamic(() => import("~/components/BlueMap"), {
  ssr: false,
});

export default function Index() {
  return <BlueMap />;
}
