import * as RadixForm from "@radix-ui/react-form";
import clsx from "clsx";

import s from "./Form.module.scss";

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
const Control = RadixForm.Control;
const ValidityState = RadixForm.ValidityState;
export { Root, Field, Label, Control, Message, ValidityState, Submit };
