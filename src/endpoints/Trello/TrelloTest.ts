import { Endpoint } from "payload/config";
import { TrelloAPI } from "../../globals/util/TrelloUtil";

const TrelloTest: Endpoint = {
    path: "/test",
    method: "get",
    handler: async (req, res) => {
        let boards = await TrelloAPI.getBoards();
        let board = boards[0];
        let cards = await board.getCards();
        let card = cards[0];
        console.log(card.getDueDate())
        res.json(card)
    }
}

export default TrelloTest;