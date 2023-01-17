import { Endpoint } from "payload/config";
import { getPublicDeviceInventory } from "../../collections/util/DevicesUtil";

const DeviceInventoryEndpoint: Endpoint = {
    path: "/inventory",
    method: "get",
    handler: async (req, res) => {
        let devices = await getPublicDeviceInventory();
        res.status(200).send(devices)
    }
}

export default DeviceInventoryEndpoint;