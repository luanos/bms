import clsx from "clsx";

import s from "./Pill.module.scss";

import type { ReactNode, HTMLAttributes } from "react";

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
