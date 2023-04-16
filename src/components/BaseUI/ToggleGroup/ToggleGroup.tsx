import * as RadixToggleGroup from "@radix-ui/react-toggle-group";
import {
  ToggleGroupMultipleProps,
  ToggleGroupSingleProps,
} from "@radix-ui/react-toggle-group";
import clsx from "clsx";
import { ComponentProps } from "react";

import s from "./ToggleGroup.module.scss";

type ToggleGroupProps = ComponentProps<typeof RadixToggleGroup.Root>;

function Root({ className, ...props }: ToggleGroupProps) {
  return (
    <RadixToggleGroup.Root
      {...props}
      className={clsx(s.root, className)}
    ></RadixToggleGroup.Root>
  );
}

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
