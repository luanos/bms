import Image from "next/image";

import s from "./Map.module.scss";

export function Map() {
  return <Image className={s.image} src="/map.png" alt="Map" fill />;
}
