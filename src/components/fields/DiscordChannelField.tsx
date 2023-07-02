import { Props } from "payload/components/fields/Text";
import { SelectInput, useField } from "payload/components/forms";
import { OptionObject } from "payload/dist/fields/config/types";
import React, { useEffect, useState } from "react";
import { useGuildContext } from "../providers/DiscordGuildProvider";

export function createDiscordChannelComponent(channelTypes: number[]) {
  let DiscordChannelField: React.FC<Props> = ({
    path,
    label,
    required,
    name,
  }) => {
    if (!path) return null;

    const { value, setValue } = useField<string | undefined>({ path: path });
    const [channelOptions, setChannelOptions] = useState<OptionObject[]>([]);
    const guild = useGuildContext();

    useEffect(() => {
      setChannelOptions(
        guild
          ? guild.channels
              .filter((c) => channelTypes.includes(c.type))
              .map((c) => ({
                label: c.name,
                value: c.id,
              }))
          : []
      );
    }, [guild]);

    return (
      <SelectInput
        name={name}
        path={path}
        label={label}
        required={required}
        value={value}
        onChange={(o) => setValue(o.value)}
        options={channelOptions}
      />
    );
  };

  return DiscordChannelField;
}
