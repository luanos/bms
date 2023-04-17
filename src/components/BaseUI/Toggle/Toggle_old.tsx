import clsx from "clsx";
import Image from "next/image";
import { ChangeEventHandler, useState } from "react";

import s from "./Toggle.module.scss";

import type { InputHTMLAttributes } from "react";

interface ToggleProps extends InputHTMLAttributes<HTMLInputElement> {
  type: "checkbox" | "radio";
  checked: boolean;
  label: string;
  imgSrc?: string;
  imgSrcChecked?: string;
}

export function Toggle({
  label,
  imgSrc,
  imgSrcChecked,
  checked,
  ...props
}: ToggleProps) {
  const src = checked && imgSrcChecked ? imgSrcChecked : imgSrc;
  return (
    <div className={clsx(s.container, checked && s.on)}>
      <input {...props} checked={checked} />
      {src && (
        <div className={s.imgWrapper}>
          <Image src={src} alt="" fill />
        </div>
      )}
      <span className={s.label}>{label}</span>
    </div>
  );
}
