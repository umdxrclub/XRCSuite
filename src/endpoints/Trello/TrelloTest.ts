import { Endpoint } from "payload/config";
import { Trello } from "../../server/trello";

const TrelloTest: Endpoint = {
    path: "/test",
    method: "get",
    handler: async (req, res) => {
        let boards = await Trello.getBoards();
        let board = boards.find(b => b.getName() == "President and Vice President")!
        await Trello.createWebhook(board.getId())
        res.status(200).send()
    }
}

export default TrelloTest;