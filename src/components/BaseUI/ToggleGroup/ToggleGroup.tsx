import * as RadixToggleGroup from "@radix-ui/react-toggle-group";
import clsx from "clsx";
import { forwardRef } from "react";

import s from "./ToggleGroup.module.scss";

import type { ComponentProps } from "react";

type ToggleGroupProps = ComponentProps<typeof RadixToggleGroup.Root>;

const Root = forwardRef<HTMLDivElement, ToggleGroupProps>(function RootBla(
  { className, ...props },
  ref
) {
  return (
    <RadixToggleGroup.Root
      ref={ref}
      {...props}
      className={clsx(s.root, className)}
    ></RadixToggleGroup.Root>
  );
});

interface ItemProps extends RadixToggleGroup.ToggleGroupItemProps {}

function Item({ ...props }: ItemProps) {
  return (
    <RadixToggleGroup.Item
      className={s.item}
      {...props}
    ></RadixToggleGroup.Item>
  );
}

export { Root, Item };
