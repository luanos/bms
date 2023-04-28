import clsx from "clsx";
import { Children } from "react";

import s from "./Stack.module.scss";
import { Separator } from "../Separator";

import type { ReactNode, CSSProperties, HTMLProps } from "react";

interface StackProps extends HTMLProps<HTMLDivElement> {
  children: ReactNode[];
  orientation: "horizontal" | "vertical";
  type?: "text" | "stretch";
  gap: string;
  separated?: boolean;
}

export function Stack({
  children,
  gap,
  orientation,
  separated = false,
  type = "text",
  style,
  className,
  ...props
}: StackProps) {
  return (
    <div
      className={clsx(s.root, className)}
      data-orientation={orientation}
      data-separated={separated}
      data-type={type}
      style={{ "--_gap": gap, ...style } as CSSProperties}
      {...props}
    >
      {Children.map(children, (child, idx) => (
        <>
          <div className={s.item}>{child}</div>
          {!!(idx < children.length - 1 && separated) && (
            <div className={s.separator}>
              <Separator
                orientation={
                  orientation == "horizontal" ? "vertical" : "horizontal"
                }
              />
            </div>
          )}
        </>
      ))}
    </div>
  );
}
