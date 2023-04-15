import c from "clsx";
import { ButtonHTMLAttributes } from "react";

import s from "./Button.module.scss";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export function Button({ className, ...props }: ButtonProps) {
  return <button className={c(s.button, className)} {...props} />;
}
