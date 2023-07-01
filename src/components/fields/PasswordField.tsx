import { Props } from "payload/components/fields/Text";
import { TextInput, useField } from "payload/components/forms";
import React, { useLayoutEffect, useRef } from "react";

const PasswordField: React.FC<Props> = ({ path, label, required, name }) => {
  if (!path) return null;
  const { value, setValue } = useField<string>({ path: path });
  const ref = useRef<HTMLInputElement | null>(null) as React.MutableRefObject<HTMLInputElement>;

  useLayoutEffect(() => {
    ref.current.type = "password";
  }, []);

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
