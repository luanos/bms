import * as RadixDialog from "@radix-ui/react-dialog";

import s from "./Dialog.module.scss";
import { EpCloseBold } from "~/components/Icons";

import type { ReactNode } from "react";

interface MainProps {
  title: string;
  description?: string;
  children: ReactNode;
}

function Main({ title, description, children }: MainProps) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className={s.overlay} />
      <RadixDialog.Content
        className={s.content}
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
      >
        <div className={s.header}>
          <RadixDialog.Title className={s.title}>{title}</RadixDialog.Title>
          <RadixDialog.Description className={s.description}>{description}</RadixDialog.Description>
        </div>
        {children}
        <RadixDialog.Close className={s.close}>
          <EpCloseBold />
        </RadixDialog.Close>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}

interface TriggerProps extends RadixDialog.DialogTriggerProps {}

/** Only A Wrapper! It's immediate and only child will be the trigger to open the dialog */
function Trigger({ asChild, ...props }: TriggerProps) {
  return <RadixDialog.Trigger asChild {...props} />;
}

const Root = RadixDialog.Root;

export { Root, Trigger, Main };
