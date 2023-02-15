import { Stack } from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import { Box } from "@mui/system";
import { Props } from "payload/components/fields/Text";
import { TextInput, useField } from "payload/components/forms";
import React, { useEffect, useRef, useState } from "react";
import { DiscordMemberInfo } from "../../types/XRCTypes";

const DiscordMemberField: React.FC<Props> = ({ path, label, required, name }) => {
  const { value, setValue } = useField<string>({ path: path });
  const [ memberInfo, setMemberInfo ] = useState<DiscordMemberInfo | null>(null);
  const ref = useRef<HTMLInputElement>();

  useEffect(() => {
    if (value.length == 18) {
      fetch(`/api/globals/bot/user/${value}`)
      .then(async res => {
        if (res.ok) {
          let j = await res.json();
          setMemberInfo(j);
        } else {
          setMemberInfo(null);
        }
      })
    } else {
      setMemberInfo(null);
    }
  }, [ value ])

  return (
    <Stack direction={"row"} spacing={2} alignItems={"center"}>
      <Box flex={3}>
        <TextInput
          inputRef={ref}
          name={name}
          path={path}
          label={label}
          required={required}
          value={value}
          onChange={setValue}
        />
      </Box>
      { memberInfo ? <Box height={50} flex={2}>
        <Stack direction={"row"} alignItems={"center"} spacing={2} >
          <img src={memberInfo.avatarUrl} style={{borderRadius: "100%", maxHeight: 50, width: "auto"}}/>
          <p>{memberInfo.name}</p>
          { memberInfo.inGuild ? null : <p style={{backgroundColor: "#f44336", paddingLeft: 8, paddingRight: 8, borderRadius: 4}}>Not in Guild</p>}
        </Stack>
      </Box> : <Skeleton /> }
    </Stack>
  );
};

export default DiscordMemberField;
