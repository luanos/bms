import * as RadixTabs from "@radix-ui/react-tabs";

import s from "./Tabs.module.scss";

import type { ReactNode } from "react";

/* These Components only add Styling to the existing Radix-Components. Everything else is the same */

/* List - Flex Element Holding Selectable Tabs*/

interface TabsListProps extends RadixTabs.TabsListProps {}

function List({ ...props }: TabsListProps) {
  return <RadixTabs.List className={s.list} {...props}></RadixTabs.List>;
}

interface TabsTriggerProps extends RadixTabs.TabsTriggerProps {
  label: string;
  icon?: ReactNode;
  iconActive?: ReactNode;
  active?: boolean;
}

/* Trigger - Selectable Tabs as UI Elements */

function Trigger({
  label,
  icon,
  iconActive,
  active,
  ...props
}: TabsTriggerProps) {
  const iconNode = active && iconActive ? iconActive : icon;

  return (
    <RadixTabs.Trigger className={s.trigger} {...props}>
      {iconNode && <div className={s.iconWrapper}>{iconNode}</div>}
      <span className={s.label}>{label}</span>
    </RadixTabs.Trigger>
  );
}

/* Other Radix Elements */

const Root = RadixTabs.Root;
const Content = RadixTabs.Content;

export { Root, List, Trigger, Content };
