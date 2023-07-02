import { Box, Stack } from "@mui/material";
import { Props } from "payload/components/fields/Text";
import {
  Checkbox,
  SelectInput,
  TextInput,
  useFormFields
} from "payload/components/forms";
import { OptionObject } from "payload/dist/fields/config/types";
import React, { useEffect, useState } from "react";
import { useGuildContext } from "../providers/DiscordGuildProvider";

const LocationNamePath = "location.name";
const IsDiscordChannelPath = "location.isDiscordChannel";

export const DiscordEventLocationField: React.FC<Props> = ({
  path,
  label,
  required,
  name,
}) => {
  if (!path) return null;
  const { location, setLocation, isDiscordChannel } =
    useFormFields(([fields, dispatch]) => ({
      location: fields[LocationNamePath].value as string,
      isDiscordChannel: fields[IsDiscordChannelPath].value as boolean,
      setLocation: (newLocation: string) =>
        dispatch({
          type: "UPDATE",
          path: LocationNamePath,
          value: newLocation,
        })
    }));
  const [channelOptions, setChannelOptions] = useState<OptionObject[]>([]);
  const guild = useGuildContext();

  useEffect(() => {
    setChannelOptions(
      guild
        ? guild.channels.filter(c => c.type == 2).map((c) => ({
            label: c.name,
            value: c.id,
          }))
        : []
    );
  }, [guild]);

  return (
    <Stack direction={"row"} spacing={2} alignItems={"center"}>
      <Box flex={1}>
        {
          isDiscordChannel ? <SelectInput
            name={name}
            path={path}
            label={label}
            required={required}
            value={location}
            onChange={o => setLocation(o.value as string)}
          options={channelOptions}
        /> : <TextInput
          name={name}
          path={path}
          label={label}
          required={true}
          value={location}
          onChange={e => setLocation(e.target.value)}
        />
        }
      </Box>
      <Checkbox path={IsDiscordChannelPath} name={"Discord Channel"} />
    </Stack>
  );
};
