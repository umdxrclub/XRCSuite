import { Endpoint } from "payload/config";
import { Device } from "payload/generated-types";
// import { sendWakeOnLAN } from "../../ws/Lab/LabWebSocket";
import { makeAdminHandler } from "../RejectIfNoUser";

const WakeOnLANEndpoint: Endpoint = {
  path: "/:id/wol",
  method: "post",
  handler: makeAdminHandler(async (req, res) => {
    console.log("Execute me?");
    let id = req.params.id;

    let device: Device;
    try {
      device = await req.payload.findByID({
        collection: "devices",
        id: id,
      });
    } catch {
      res.status(400).send({ error: "Unknown device id. " });
      return;
    }

    if (device.mac) {
      // sendWakeOnLAN(device.mac);
      res.status(200).send({ message: "Send WOL packet!" });
    } else {
      res.status(400).send({ error: "Device does not have a MAC address!" });
    }
  }),
};

export default WakeOnLANEndpoint;
