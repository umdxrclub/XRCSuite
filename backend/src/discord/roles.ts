import { Client, Message, MessageReaction, PartialMessageReaction, PartialUser, TextChannel, User } from "discord.js";

// export async function onReactionAdd(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) {
//     if (reaction.partial) {
//         try {
//             // Fetch complete data
//             await reaction.fetch()
//         } catch (error) {
//             console.error("Couldn't fetch message when parsing reaction: " + error);
//             return;
//         }
//     }

//     // Only continue if the reaction wasn't created by the bot.
//     let guildReactionMessage = await XRDiscordData.shared.getReactionMessageId(reaction.message.guildId!)
//     let isRoleReactionMessage = guildReactionMessage === reaction.message.id;
//     let isOwnReaction = user.id === reaction.client.user?.id;
//     if (isRoleReactionMessage && !isOwnReaction) {
//         let config = await getDiscordConfig();

//         // Determine if there is a role associated with that emoji
//         let guildId = reaction.message.guildId!
//         var roleId = config.guilds[guildId]?.roles.reactions[reaction.emoji.toString()]

//         if (roleId) {
//             let guild = reaction.message.guild;
//             let guildHasRole = guild && guild.roles.cache.has(roleId)

//             if (guildHasRole) {
//                 let guildMember = guild!.members.cache.get(user.id)!
//                 let userHasRole = guildMember.roles.cache.has(roleId);

//                 if (userHasRole) {
//                     await guildMember.roles.remove(roleId, "User removed their role through a role message.");
//                 } else {
//                     await guildMember.roles.add(roleId, "User added their role through a role message.");
//                 }
//             }
//         }

//         // Remove reaction
//         await reaction.users.remove(user.id);
//     }
// }

// /**
//  * Creates a message with reaction emojis to allow people to add roles.
//  *
//  * @param channelId The channel to create the react message in
//  */
// export async function createRoleReactMessage(client: Client, guildId: string) {
//     let config = await getDiscordConfig();

//     // Ensure that the provided guild id exists in the roles file.
//     if (Object.keys(config.guilds).includes(guildId)) {
//         let guild = client.guilds.cache.get(guildId);

//         if (guild) {
//             let guildConfig = config.guilds[guildId];
//             let existingReactionMessageId = await XRDiscordData.shared.getReactionMessageId(guildId)

//             let channel = guild.channels.cache.get(guildConfig.roles.channelId) as TextChannel | undefined;

//             if (channel) {
//                 var msg: Message<boolean> | undefined = undefined

//                 if (existingReactionMessageId) {
//                     // Try to load previous message.
//                     try {
//                         msg = await channel?.messages.fetch(existingReactionMessageId)
//                     } catch {
//                         msg = undefined;
//                     }
//                 }

//                 if (!msg) {
//                     msg = await channel.send("Choose a role below!");
//                     await XRDiscordData.shared.setReactionMessageId(guildId, msg!.id);
//                 }

//                 // Remove any existing roles.
//                 await msg.reactions.removeAll();

//                 // Add reactions
//                 let roleEmoji = Object.keys(guildConfig.roles.reactions);
//                 roleEmoji.forEach(async emoji => {
//                     await msg!.react(emoji)
//                 })
//             }
//         }
//     }
// }
