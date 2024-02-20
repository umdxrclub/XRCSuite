import { PayloadModelTransformer } from "@xrclub/club.js/dist/payload/model-hooks";
import XRC from "../../server/XRC";

let transformer = new PayloadModelTransformer(
  XRC.events,
  "events",
  (e) => {
    return {
      isPublished: e.published,
      name: e.name,
      description: e.description,
      startDate: e.startDate.toISOString(),
      endDate: e.endDate.toISOString(),
      thumbnail: e.thumbnail,
      location: e.location,
      discord: {
        createGuildEvent: e.discord.createGuildEvent ?? true,
        createEmbedMessage: e.discord.createEmbedMessage ?? true,
        eventMessages: e.discord.eventMessages,
        guildEvents: e.discord.guildEvents
      },
      gcal: {
        events: e.gcal.events,
        publishOnGCal: e.gcal.publishOnGCal
      }
    };
  },
  (pe) => {
    return {
      id: pe.id,
      published: pe.isPublished,
      name: pe.name,
      description: pe.description,
      startDate: new Date(pe.startDate),
      endDate: new Date(pe.endDate),
      thumbnail: pe.thumbnail,
      location: pe.location ?? {},
      discord: {
        eventMessages: pe.discord.eventMessages,
        guildEvents: pe.discord.guildEvents,
      },
      gcal: {
        events: pe.gcal?.events,
        publishOnGCal: pe.gcal?.publishOnGCal,
      },
    };
  }
);

export const EventBeforeChangeHook = transformer.createBeforeChangeHook();
export const EventAfterDeleteHook = transformer.createAfterDeleteHook();
