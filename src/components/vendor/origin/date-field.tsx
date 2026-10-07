import { TextField, type TextFieldProps } from "./text-field";

export type DateFieldProps = Omit<TextFieldProps, "type">;

/* Native date input in field dress. The native picker keeps full keyboard and
   screen-reader operability with zero dependencies. */
export function DateField(props: DateFieldProps) {
  return <TextField type="date" {...props} />;
}
