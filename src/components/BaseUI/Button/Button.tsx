import c from "clsx";

import s from "./Button.module.scss";

import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export function Button({ className, ...props }: ButtonProps) {
  return <button className={c(s.button, className)} {...props} />;
}
