import { rest } from "lodash";
import { Endpoint } from "payload/config";
import Devices from "../../collections/Devices";
import { Device } from "../../types/PayloadSchema";
import { sendWakeOnLAN } from "../../ws/Lab/LabWebSocket";

const WakeOnLANEndpoint: Endpoint = {
    path: "/:id/wol",
    method: "post",
    handler: async (req, res) => {
        let id = req.params.id;

        let device = await req.payload.findByID<Device>({
            collection: Devices.slug,
            id: id
        });

        if (device.mac) {
            sendWakeOnLAN(device.mac)
            res.status(200).send({ message: "Send WOL packet!" })
        } else {
            res.status(400).send({ error: "Device does not have a MAC address!" })
        }
    }
}

export default WakeOnLANEndpoint;