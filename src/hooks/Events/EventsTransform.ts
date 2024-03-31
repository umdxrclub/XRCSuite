import { PayloadModelTransformer } from "@xrclub/club.js/dist/payload/model-hooks";
import XRC, { XRCEvent } from "../../server/XRC";
import { Event } from "payload/generated-types";

let transformer = new PayloadModelTransformer(
  XRC.events,
  "events",
  (e) => {
    let t: Partial<Event> = {
      isPublished: e.published,
      name: e.name,
      description: e.description,
      tags: (e.tags ?? []).map(t => ({ tag: t })),
      startDate: e.startDate.toISOString(),
      endDate: e.endDate.toISOString(),
      thumbnail: e.thumbnail,
      location: e.location,
      discord: {
        createGuildEvent: e.discord.createGuildEvent ?? true,
        createEmbedMessage: e.discord.createEmbedMessage ?? true,
        mentionNotificationRoles: e.discord.mentionNotificationRoles ?? true,
        eventMessages: e.discord.eventMessages,
        guildEvents: e.discord.guildEvents,
      },
      gcal: {
        events: e.gcal.events,
        publishOnGCal: e.gcal.publishOnGCal ?? true
      }
    };

    console.log("Event -> Payload", e, t)
    return t;
  },
  (pe) => {
    let t: XRCEvent = {
      id: pe.id,
      published: pe.isPublished,
      name: pe.name,
      description: pe.description,
      tags: (pe.tags ?? []).map(i => i.tag),
      startDate: new Date(pe.startDate),
      endDate: new Date(pe.endDate),
      thumbnail: pe.thumbnail,
      location: pe.location ?? {},
      discord: {
        eventMessages: pe.discord.eventMessages,
        guildEvents: pe.discord.guildEvents,
        createEmbedMessage: pe.discord.createEmbedMessage,
        createGuildEvent: pe.discord.createGuildEvent,
        mentionNotificationRoles: pe.discord.mentionNotificationRoles
      },
      gcal: {
        events: pe.gcal?.events,
        publishOnGCal: pe.gcal?.publishOnGCal,
      },
    };

    console.log("Payload -> Event", pe, t)
    return t;
  }
);

export const EventBeforeChangeHook = transformer.createBeforeChangeHook();
export const EventAfterDeleteHook = transformer.createAfterDeleteHook();
