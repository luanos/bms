import * as RadixSeparator from "@radix-ui/react-separator";
import clsx from "clsx";

import s from "./Separator.module.scss";

interface SeparatorProps extends RadixSeparator.SeparatorProps {}

export function Separator({ className, ...props }: SeparatorProps) {
  return <RadixSeparator.Root className={clsx(s.root, className)} {...props} />;
}
