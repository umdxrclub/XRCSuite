import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, RGBTuple } from "discord.js";
import { getDiscordClient } from "../../discord/bot";
import { Poll } from "../../types/PayloadSchema";

const PollOpenColor: RGBTuple = [12,187,240]
const PollCloseColor: RGBTuple = [240,183,12]

function createProgressBar(percentage: number) {
    const fill = "█" // "🟦"
    const background = " " // "⬛"
    const numCells = 20

    let numFillCells = Math.round(percentage * numCells);

    var progressBar = ""
    for (var i = 0; i < numCells; i++) {
        progressBar += i < numFillCells ? fill : background
    }

    progressBar = '`' + progressBar + '`'

    return progressBar
}

export async function createPollEmbedAndRow(poll: Poll) {
    let client = getDiscordClient();
    if (!client) return;
    
    // Extract info from the poll
    let title = poll.title;
    let choices = poll.choices ?? [];
    let totalVotes = choices.reduce((acc, c) => acc + (c.voters?.length ?? 0), 0)
    let author = await client.users.fetch(poll.author)

    // Create the embed
    let embed = new EmbedBuilder()
    embed.setTitle(title)
    embed.setFields(...[...choices] // copy array to prevent sorting the buttons
        .map((c, i) => {
            let numVoters = c.voters?.length ?? 0;
            let percentage = numVoters/totalVotes;
            let displayPercentage = totalVotes == 0 ? 0 : Math.round(100*percentage)
            let text = `**${numVoters}** \u200b \u200b \u200b ${createProgressBar(percentage)} (${displayPercentage}%)`;

            // If the poll is closed and this choice won, bold it and add trophy.
            if (!poll.open && i == 0) {
                text = `**${text}** 🏆`
            }

            return {
                name: c.name,
                value: text,
                inline: false
            }
        })
    )
    embed.setAuthor({ name: author.username, iconURL: author.displayAvatarURL() })
    embed.setFooter({ text: `${totalVotes} vote${totalVotes != 1 ? "s" : ""}` })
    embed.setColor(poll.open ? PollOpenColor : PollCloseColor)

    var row = null
    if (poll.open) {
        // Create the button row
        row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(choices.map((c, i) =>
                new ButtonBuilder()
                    .setCustomId(`POLL-${poll.id}-${i}`)
                    .setLabel(c.name)
                    .setStyle(ButtonStyle.Primary)
            ))
    }

    return {
        embed, row
    };
}
