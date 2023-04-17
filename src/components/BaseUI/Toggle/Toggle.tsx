import * as RadixToggle from "@radix-ui/react-toggle";
import Image from "next/image";

import s from "./Toggle.module.scss";

import type { ReactNode } from "react";

interface ToggleProps extends RadixToggle.ToggleProps {
  label: string;
  icon?: ReactNode;
  iconPressed?: ReactNode;
}

export function Toggle({
  label,
  icon,
  iconPressed,
  pressed,
  ...props
}: ToggleProps) {
  const iconNode = pressed && iconPressed ? iconPressed : icon;
  return (
    <RadixToggle.Root className={s.root} {...props}>
      {iconNode && <div className={s.iconWrapper}>{iconNode}</div>}
      <span className={s.label}>{label}</span>
    </RadixToggle.Root>
  );
}
