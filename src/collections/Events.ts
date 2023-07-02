import { CollectionConfig } from "payload/types";
import {
} from "../components/PostActionButton";
import { EventThumbnail } from "../components/EventThumbnail";
import { createLinkButton } from "../components/LinkButton";
import { DiscordEventLocationField } from "../components/fields/DiscordEventLocationField";
import AnnounceEventEndpoint from "../endpoints/Events/AnnounceEvent";
import CreateDiscordEventEndpoint from "../endpoints/Events/CreateDiscordEvent";
import EventCheckIn from "../endpoints/Events/EventCheckIn";
import ImportEventsEndpoint from "../endpoints/Events/ImportTerpLinkEvents";
import TerpLinkEventCheckIn from "../endpoints/Events/TerpLinkEventCheckIn";
import { CollectionSlugs } from "../slugs";
import { createActionButtons } from "../components/ActionButtons";

const Events: CollectionConfig = {
  slug: CollectionSlugs.Events,
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "startDate", "endDate"],
  },
  endpoints: [
    ImportEventsEndpoint,
    EventCheckIn,
    TerpLinkEventCheckIn,
    AnnounceEventEndpoint,
    CreateDiscordEventEndpoint,
  ],
  fields: [
    {
      name: "announceEvent",
      type: "ui",
      admin: {
        components: {
          Field: createActionButtons([
            {
              type: "action",
              title: "Announce Event",
              postUrl: "/api/events/:id/announce",
            },
            {
              type: "action",
              title: "Create Discord Event",
              postUrl: "/api/events/:id/discord-event",
            },
            {
              type: "link",
              name: "Launch Gatekeeper",
              url: "/admin/gatekeeper/event/:id"
            }
          ]),
        },
      },
    },
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "type",
      type: "text",
    },
    {
      name: "location",
      type: "group",
      admin: {
        components: {
          Field: DiscordEventLocationField,
        },
      },
      fields: [
        {
          name: "isDiscordChannel",
          type: "checkbox",
          required: true,
          defaultValue: false,
        },
        {
          name: "name",
          type: "text",
          required: true,
        },
      ],
    },
    {
      name: "startDate",
      type: "date",
      admin: {
        date: {
          pickerAppearance: "dayAndTime",
        },
      },
      required: true,
    },
    {
      name: "endDate",
      type: "date",
      admin: {
        date: {
          pickerAppearance: "dayAndTime",
        },
      },
      required: true,
    },
    {
      name: "description",
      type: "textarea",
    },
    {
      name: "imageUrl",
      type: "text",
    },
    {
      type: "collapsible",
      label: "Thumbnail",
      fields: [
        {
          type: "ui",
          name: "thumbnail",
          admin: {
            components: {
              Field: EventThumbnail,
            },
          },
        },
      ],
    },
    {
      name: "terplink",
      type: "group",
      fields: [
        {
          name: "eventId",
          type: "text",
          index: true,
        },
        {
          name: "accessCode",
          type: "text",
          index: true,
        },
      ],
    },
    {
      name: "discord",
      type: "group",
      fields: [
        {
          name: "eventId",
          type: "text",
        },
        {
          name: "messageId",
          type: "text",
        },
      ],
    },
  ],
};

export default Events;
