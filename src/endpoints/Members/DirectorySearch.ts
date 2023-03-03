import { Endpoint } from "payload/config";
import XRC from "../../server/XRC";
import { makeAdminHandler } from "../RejectIfNoUser";

const DirectorySearchEndpoint: Endpoint = {
    method: "get",
    path: "/directory",
    handler: makeAdminHandler(async (req, res) => {
        let name = req.query.name as string;
        let result = await XRC.directory.search(name)
        res.status(200).send(result)
    })
}

export default DirectorySearchEndpoint;