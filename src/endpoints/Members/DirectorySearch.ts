import { Endpoint } from "payload/config";
import XRC from "../../util/XRC";

const DirectorySearchEndpoint: Endpoint = {
    method: "get",
    path: "/directory",
    handler: async (req, res) => {
        let name = req.query.name as string;
        let result = await XRC.directory.search(name)
        res.status(200).send(result)
    }
}

export default DirectorySearchEndpoint;