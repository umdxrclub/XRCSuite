import React, { useEffect, useRef, useState } from "react";
import { Props } from "payload/components/fields/Text";
import { useField, TextInput, SelectInput } from "payload/components/forms";
import { useGuildContext } from "../providers/DiscordGuildProvider";
import { OptionObject } from "payload/dist/fields/config/types";

const DiscordChannelField: React.FC<Props> = ({ path, label, required, name }) => {
    if (!path) return null;
    
    const { value, setValue } = useField<string | undefined>({ path: path });
    const [ channelOptions, setChannelOptions ] = useState<OptionObject[]>([])
    const guild = useGuildContext();

    useEffect(() => {
        setChannelOptions(guild ? guild.channels
            .filter(c => c.type == 0 || c.type == 5)
            .map(c => ({
                label: c.name,
                value: c.id
            })
        ): [])
    }, [guild])

    return (
        <SelectInput
            name={name}
            path={path}
            label={label}
            required={required}
            value={value}
            onChange={o => setValue(o.value)}
            options={channelOptions}
        />
    );
};

export default DiscordChannelField;