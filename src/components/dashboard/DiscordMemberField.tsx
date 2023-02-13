import { Props } from "payload/components/fields/Text";
import { TextInput, useField } from "payload/components/forms";
import { Button } from "payload/components/elements";
import React, {useRef, useLayoutEffect} from "react";

const DiscordMemberField: React.FC<Props> = ({ path, label, required, name }) => {
  const { value, setValue } = useField<string>({ path: path });
  const ref = useRef<HTMLInputElement>();

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

export default DiscordMemberField;
