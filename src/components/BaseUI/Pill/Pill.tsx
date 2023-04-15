import clsx from "clsx";
import { ReactNode, HTMLAttributes } from "react";

import s from "./Pill.module.scss";

interface PillProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export function Pill({ children, className, ...props }: PillProps) {
  return (
    <div className={clsx(s.container, className)} {...props}>
      {children}
    </div>
  );
}
