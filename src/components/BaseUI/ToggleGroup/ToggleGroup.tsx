import * as RadixToggleGroup from "@radix-ui/react-toggle-group";
import clsx from "clsx";
import { ComponentProps, forwardRef } from "react";

import s from "./ToggleGroup.module.scss";

type ToggleGroupProps = ComponentProps<typeof RadixToggleGroup.Root>;

const Root = forwardRef<HTMLDivElement, ToggleGroupProps>(function RootBla(
  { className, orientation = "horizontal", ...props },
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
