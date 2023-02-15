import React, { useEffect, useRef, useState } from "react";
import { Props } from "payload/components/fields/Text";
import { useField, TextInput, SelectInput } from "payload/components/forms";
import { useGuildContext } from "../providers/DiscordGuildProvider";
import { OptionObject } from "payload/dist/fields/config/types";

const DiscordRoleField: React.FC<Props> = ({ path, label, required, name }) => {
    const { value, setValue } = useField<string>({ path: path });
    const [ channelOptions, setChannelOptions ] = useState<OptionObject[]>([])
    const guild = useGuildContext();

    useEffect(() => {
        setChannelOptions(guild ? guild.roles
            .map(r => ({
                label: r.name,
                value: r.id
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

export default DiscordRoleField;