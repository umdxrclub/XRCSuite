import {
  Button,
  DialogContent,
  DialogTitle,
  Select,
  Stack,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import React, { useState, useRef, useCallback } from "react";
import { ResolveMethod } from "../../../types/XRCTypes";

type ResolveDialogProps = {
  open: boolean;
  onClose: () => void;
  submitResolve: (method: ResolveMethod, value: string) => void;
};

const ResolveMethods: Partial<Record<ResolveMethod, string>> = {
  terplink: "TerpLink Event Pass JSON",
  card: "Swipecard Serial Number",
  id: "Member ID",
};

export const ResolveDialog: React.FC<ResolveDialogProps> = ({
  open,
  onClose,
  submitResolve: resolve,
}) => {
  const [resolveMethod, setResolveMethod] = useState<ResolveMethod>("terplink");
  const [value, setValue] = useState<string>("");

  const submit = () => {
    console.log(resolveMethod, value);
    resolve(resolveMethod, value);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Manual Member Resolve</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Select
            label={"Resolve Method"}
            value={resolveMethod}
            onChange={(e) => setResolveMethod(e.target.value as ResolveMethod)}
          >
            {Object.keys(ResolveMethods).map((k) => (
              <MenuItem key={k} value={k}>
                {ResolveMethods[k]}
              </MenuItem>
            ))}
          </Select>
          <TextField
            label={"Value"}
            fullWidth
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={submit}>Submit</Button>
      </DialogActions>
    </Dialog>
  );
};
