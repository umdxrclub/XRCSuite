import { getMemberFromDiscordId } from "../../collections/util/MembersUtil";
import { Trello } from "../../server/trello";
import { InteractionHandler } from "./interactions";

const TrelloRegex = /Trello-(.*)-(.*)/;

const TrelloInteractionHandler: InteractionHandler = async interaction => {
    if (interaction.isButton() && TrelloRegex.test(interaction.customId)) {
        let match = TrelloRegex.exec(interaction.customId)!;
        let [_, action, cardId] = match;
        console.log(interaction.customId, action, cardId)
        let card = await Trello.getCard(cardId);
        let member = await getMemberFromDiscordId(interaction.user.id);

        if (!member) {
            await interaction.reply({content: "Cannot proceed because your Discord is not registered!", ephemeral: true})
            return;
        }
        let memberName = member.name;

        switch (action) {
            case "Accept":
                await card.addComment(`${memberName} has accepted this task.`)
                await interaction.reply({content: "You have accepted your task!", ephemeral: true })
                break;

            default:
                break;
        }
    }
}

export default TrelloInteractionHandler;