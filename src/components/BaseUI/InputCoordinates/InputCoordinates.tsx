import s from "./InputCoordinates.module.scss";
import { Separator } from "~/components/BaseUI/Separator";
export function InputCoordinates() {
  return (
    <div className={s.root}>
      <input
        type="number"
        style={{ "--_pseudo-content": "X" } as React.CSSProperties}
      />
      <Separator orientation="vertical" className={s.separator} />
      <input
        type="number"
        style={{ "--_pseudo-content": "Y" } as React.CSSProperties}
      />
      <Separator orientation="vertical" className={s.separator} />
      <input
        type="number"
        style={{ "--_pseudo-content": "Z" } as React.CSSProperties}
      />
    </div>
  );
}
