import { Props } from "payload/components/fields/Text";
import { TextInput, useField } from "payload/components/forms";
import { Button } from "payload/components/elements";
import React, {useRef, useLayoutEffect} from "react";

const PasswordField: React.FC<Props> = ({ path, label, required, name }) => {
  const { value, setValue } = useField<string>({ path: path });
  const ref = useRef<HTMLInputElement>();

  useLayoutEffect(() => {
    ref.current.type = "password"
    console.log("hello there")
  }, [])

  return (
    <TextInput
      inputRef={ref}
      name={name}
      path={path}
      label={label}
      required={required}
      value={value}
      onChange={setValue}
    />
  );
};

export default PasswordField;
