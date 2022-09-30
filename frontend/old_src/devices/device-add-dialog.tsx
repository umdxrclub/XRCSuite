// import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from "@mui/material"
// import { useRef } from "react";
// import { getXRC } from "../xrc-api";

// interface DeviceAddDialogProps {
//     open: boolean,
//     onClose: () => void,
//     onAdd?: () => void,
// }

// export const DeviceAddDialog: React.FC<DeviceAddDialogProps> = ({ open, onClose, onAdd, children}) => {
//     const deviceNameRef = useRef<string>();
//     const deviceSerialRef = useRef<string>();

//     async function onDialogAdd() {
//         const name = deviceNameRef.current
//         const serial = deviceSerialRef.current

//         let res = await getXRC().post("/devices", { query: {
//             serial: serial!,
//             name: name!
//         }})

//         // Call on device add callback
//         if (onAdd)
//             onAdd()

//         // Close dialog
//         onClose()
//     }

//     return <Dialog open={open} onClose={onClose}>
//         <DialogTitle>Add Device</DialogTitle>
//         <DialogContent>
//             <TextField
//                 autoFocus
//                 margin="dense"
//                 id="name"
//                 label="Device Name"
//                 type="text"
//                 fullWidth
//                 variant="standard"
//                 onChange={e => deviceNameRef.current = e.target.value}
//             />

//             <TextField
//                 margin="dense"
//                 id="serial"
//                 label="Device Serial Number"
//                 type="text"
//                 fullWidth
//                 variant="standard"
//                 onChange={e => deviceSerialRef.current = e.target.value}
//             />
//         </DialogContent>
//         <DialogActions>
//             <Button onClick={onClose}>Cancel</Button>
//             <Button onClick={onDialogAdd}>Add</Button>
//         </DialogActions>
//     </Dialog>
// }