import { Dialog, Grid, Stack } from "@mui/material";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import { Box } from "@mui/system";
import { Button } from "payload/components/elements";
import { Props } from "payload/components/fields/Text";
import { TextInput, useField } from "payload/components/forms";
import React, { useEffect, useState } from "react";
import { useGuildContext } from "../providers/DiscordGuildProvider";

const DiscordEmojiField: React.FC<Props> = ({ path, label, required, name }) => {
  if (!path) return null;

  const { value, setValue } = useField<string>({ path: path });
  const [ open, setPickerOpen ] = useState<boolean>(false);
  const [ emojiUrl, setEmojiUrl ] = useState<string | null>(null);
  const guild = useGuildContext();

  useEffect(() => {
    if (guild) {
        let emoji = guild.emojis.find(e => e.id === value)
        setEmojiUrl(emoji ? emoji.url : null)
    }
  }, [guild, value]);

  return (
    <Stack direction={"row"} spacing={2} alignItems={"center"}>
    <Dialog open={open} onClose={() => setPickerOpen(false)} fullWidth>
        <DialogTitle>Pick an Emoji</DialogTitle>
        <DialogContent>
            <Grid container spacing={2} columns={5}>
            {guild?.emojis.map(e => <Grid item xs={1} key={e.id}>
                <IconButton onClick={() => {
                    setValue(e.id)
                    setPickerOpen(false)
                }}>
                    <img src={e.url} style={{padding: 8}} />
                </IconButton>
            </Grid>)}
            </Grid>
        </DialogContent>
    </Dialog>
      <Box flex={1}>
        <TextInput
          name={name}
          path={path}
          label={label}
          required={required}
          value={value}
          onChange={setValue}
        />
      </Box>
      { emojiUrl ? <img src={emojiUrl} style={{maxHeight: 50}}/> : null }
      { guild ? <Button onClick={() => setPickerOpen(true)}>
        Choose Emoji
      </Button> : null }
    </Stack>
  );
};

export default DiscordEmojiField;
