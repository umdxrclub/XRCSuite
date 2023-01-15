import { Endpoint } from "payload/dist/config/types";
import { registerCommands } from "../../discord/util";

const RegisterSlashCommandsEndpoint: Endpoint = {
    path: "/registerCommands",
    method: "post",
    handler: async (req, res, next) => {
        await registerCommands()
        res.status(200).send({ message: "Commands were successfully registered!" })
    }
}

export default RegisterSlashCommandsEndpoint;