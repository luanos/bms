import * as RadixForm from "@radix-ui/react-form";
import clsx from "clsx";

import s from "./Form.module.scss";
import { Separator } from "~/components/BaseUI/Separator";
import { EpArrowRightBold } from "~/components/Icons";

import type { SelectHTMLAttributes } from "react";

interface RootProps extends RadixForm.FormProps {}
function Root({ className, ...props }: RootProps) {
  return <RadixForm.Root className={clsx(s.root, className)} {...props} />;
}

interface FieldProps extends RadixForm.FormFieldProps {}
function Field({ className, ...props }: FieldProps) {
  return <RadixForm.Field className={clsx(s.field, className)} {...props} />;
}

interface LabelProps extends RadixForm.FormLabelProps {}
function Label({ className, ...props }: LabelProps) {
  return (
    <RadixForm.Label
      className={clsx(s.label, className)}
      {...props}
    ></RadixForm.Label>
  );
}

interface MessageProps extends RadixForm.FormMessageProps {}
function Message({ className, ...props }: MessageProps) {
  return (
    <RadixForm.Message className={clsx(s.message, className)} {...props} />
  );
}

interface SubmitProps extends RadixForm.FormSubmitProps {}
function Submit({ className, ...props }: SubmitProps) {
  return (
    <RadixForm.Submit
      className={clsx(s.button, s.submit, className)}
      {...props}
    />
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

function Select({ children, ...props }: SelectProps) {
  return (
    <div className={s.selectRoot}>
      <RadixForm.Control asChild>
        <select {...props}>{children}</select>
      </RadixForm.Control>
      <EpArrowRightBold className={s.selectArrow} />
    </div>
  );
}

interface InputCoordinatesProps {
  required?: boolean;
}

function InputCoordinates({ required }: InputCoordinatesProps) {
  return (
    <div className={s.inputCoordinates}>
      <RadixForm.Field name="xCoord" className={s.field}>
        <RadixForm.Control type="number" required={required} />
        <RadixForm.Label>X</RadixForm.Label>
        <RadixForm.Message
          name="xCoord"
          className={s.message}
          match="valueMissing"
        >
          Testnachricht X
        </RadixForm.Message>
      </RadixForm.Field>
      <Separator orientation="vertical" className={s.separator} />
      <RadixForm.Field name="yCoord" className={s.field}>
        <RadixForm.Control type="number" required={required} />
        <RadixForm.Label>Y</RadixForm.Label>
        <RadixForm.Message
          name="yCoord"
          className={s.message}
          match="valueMissing"
        >
          Testnachricht Y
        </RadixForm.Message>
      </RadixForm.Field>
      <Separator orientation="vertical" className={s.separator} />
      <RadixForm.Field name="zCoord" className={s.field}>
        <RadixForm.Control type="number" required={required} />
        <RadixForm.Label>Z</RadixForm.Label>
        <RadixForm.Message
          name="zCoord"
          className={s.message}
          match="valueMissing"
        >
          Testnachricht Z
        </RadixForm.Message>
      </RadixForm.Field>
    </div>
  );
}

const Control = RadixForm.Control;
const ValidityState = RadixForm.ValidityState;

export {
  Root,
  Field,
  Label,
  Control,
  Select,
  InputCoordinates,
  Message,
  ValidityState,
  Submit,
};
