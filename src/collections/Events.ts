import { CollectionConfig } from "payload/types";
import { createActionButtons } from "../components/ActionButtons";
import { EventThumbnail } from "../components/EventThumbnail";
import { } from "../components/PostActionButton";
import EventCheckIn from "../endpoints/Events/EventCheckIn";
import ImportEventsEndpoint from "../endpoints/Events/ImportTerpLinkEvents";
import TerpLinkEventCheckIn from "../endpoints/Events/TerpLinkEventCheckIn";
import {
  EventAfterDeleteHook,
  EventBeforeChangeHook
} from "../hooks/Events/EventsTransform";
import { CollectionSlugs } from "../slugs";

const Events: CollectionConfig = {
  slug: CollectionSlugs.Events,
  admin: {
    hooks: {
      beforeDuplicate: undefined
    },
    useAsTitle: "name",
    defaultColumns: ["name", "startDate", "endDate"],
  },
  endpoints: [ImportEventsEndpoint, EventCheckIn, TerpLinkEventCheckIn],
  hooks: {
    beforeChange: [EventBeforeChangeHook],
    afterDelete: [EventAfterDeleteHook],
  },
  fields: [
    {
      name: "buttons",
      type: "ui",
      admin: {
        components: {
          Field: createActionButtons([
            {
              type: "link",
              name: "Launch Gatekeeper",
              url: "/admin/gatekeeper/event/:id",
            },
          ]),
        },
      },
    },
    {
      name: "isPublished",
      type: "checkbox",
      defaultValue: false,
      required: true
    },
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "tags",
      type: "array",
      fields: [
        {
          name: "tag",
          type: "text",
          required: true
        }
      ]
    },
    {
      name: "location",
      type: "group",
      fields: [
        {
          name: "irl",
          type: "text",
        },
        {
          name: "online",
          type: "text",
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
      name: "thumbnail",
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
      name: "discord",
      type: "group",
      fields: [
        {
          type: "checkbox",
          name: "createGuildEvent",
          required: true,
          defaultValue: true,
        },
        {
          type: "checkbox",
          name: "createEmbedMessage",
          required: true,
          defaultValue: true,
        },
        {
          type: "checkbox",
          name: "mentionNotificationRoles",
          required: true,
          defaultValue: true,
        },
        {
          name: "eventMessages",
          type: "array",
          fields: [
            {
              type: "text",
              name: "messageId",
              required: true,
            },
            {
              type: "text",
              name: "channelId",
              required: true,
            },
          ],
        },
        {
          name: "guildEvents",
          type: "array",
          fields: [
            {
              type: "text",
              name: "eventId",
              required: true,
            },
            {
              type: "text",
              name: "guildId",
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: "gcal",
      type: "group",
      fields: [
        {
          name: "publishOnGCal",
          type: "checkbox",
          required: true,
          defaultValue: true,
        },
        {
          name: "events",
          type: "array",
          fields: [
            {
              name: "eventId",
              type: "text",
              required: true,
            },
            {
              name: "calendarId",
              type: "text",
              required: true,
            },
          ],
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
  ]
};

export default Events;
