import { EmbedBuilder } from "@discordjs/builders";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  GuildScheduledEventEntityType,
  GuildScheduledEventPrivacyLevel,
  TextChannel,
} from "discord.js";
import moment from "moment";
import payload from "payload";
import { getGuild, sendGuildMessage } from "../../discord/util";
import { Event } from "../../types/PayloadSchema";

export function createEventEmbed(event: Event): EmbedBuilder {
  let embed = new EmbedBuilder();

  embed.setTitle(event.name);

  if (event.imageUrl) embed.setImage(event.imageUrl);

  if (event.description && event.description.length > 0)
    embed.setDescription(event.description);

  if (event.type) {
    embed.addFields({
      name: "Type",
      value: event.type,
    });
  }

  if (event.location) {
    embed.addFields({
      name: "Where",
      value: event.location,
    });
  }

  let startMoment = moment(event.startDate);
  let endMoment = moment(event.endDate);

  if (startMoment.isSame(endMoment, "date")) {
    let startDate = startMoment.format("dddd, MMMM Do YYYY");
    let startTime = startMoment.format("h:mm A");
    let endTime = endMoment.format("h:mm A");
    let date = `${startDate} from ${startTime} - ${endTime}`;

    embed.addFields({
      name: "When",
      value: date,
    });
  }

  if (event.terplink.eventId) {
    embed.setURL(`https://terplink.umd.edu/event/${event.terplink.eventId}`);
  }

  return embed;
}

export async function createGuildEvent(event: Event) {
  let guild = await getGuild();
  if (!guild) return null;

  var description = event.description as string;
  if (description.length > 1000) {
    description = description.substring(0, 1000 - 3) + "...";
  }

  let guildEvent = await guild.scheduledEvents.create({
    name: event.name,
    description: description,
    scheduledStartTime: event.startDate,
    scheduledEndTime: event.endDate,
    entityType: GuildScheduledEventEntityType.External,
    privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
    entityMetadata: {
      location: event.location ?? "Unknown",
    },
    image: event.imageUrl,
  });

  return guildEvent;
}

export async function announceEvent(event: Event, channel?: TextChannel) {
  // Create Discord event if necessary.
  let guild = await getGuild();
  if (!guild) return;

  var discordEventId = event.discord.eventId;

  // If there's already a discord event created (hence an id exists), then do
  // nothing.
  if (discordEventId) return;

  let guildEvent = await createGuildEvent(event);
  if (!guildEvent?.id) return;
  discordEventId = guildEvent.id;

  await payload.update({
    collection: "events",
    id: event.id,
    data: {
      discord: {
        eventId: discordEventId,
      },
    },
  });

  let embed = createEventEmbed(event);
  var row = new ActionRowBuilder<ButtonBuilder>();

  // Add a View on TerpLink button
  if (event.terplink.eventId) {
    row.addComponents(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel("View on TerpLink")
        .setURL(`https://terplink.umd.edu/event/${event.terplink.eventId}`)
    );
  }

  // add a View Discord Event button
  row.addComponents(
    new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setLabel("View Discord Event")
      .setURL(`https://discord.com/events/${guild.id}/${discordEventId}`)
  );

  let content = { embeds: [embed], components: [row] };
  if (channel) {
    await channel.send(content);
  } else {
    await sendGuildMessage("events", content);
  }
}
