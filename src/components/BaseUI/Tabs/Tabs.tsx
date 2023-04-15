import * as RadixTabs from "@radix-ui/react-tabs";
import Image from "next/image";
import { ReactNode } from "react";

import s from "./Tabs.module.scss";

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

export { List, Trigger };
