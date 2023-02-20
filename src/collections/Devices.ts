import { CollectionConfig } from "payload/types";
import { createActionButton } from "../components/ActionButton";
import DeviceInventoryEndpoint from "../endpoints/Devices/DeviceInventory";
import WakeOnLANEndpoint from "../endpoints/Devices/WakeOnLAN";
import { CollectionSlugs } from "../slugs";
import { DeviceStatus, HardwareDescriptionPrefix } from "../types/XRCTypes";
import Descriptions from "./Descriptions";

const MACAddressRegex = /^[a-fA-F0-9]{2}(:[a-fA-F0-9]{2}){5}$/;

const Devices: CollectionConfig = {
  slug: CollectionSlugs.Devices,
  admin: {
    useAsTitle: "description",
    group: "Inventory",
  },
  endpoints: [DeviceInventoryEndpoint, WakeOnLANEndpoint],
  fields: [
    {
      name: "description",
      type: "relationship",
      relationTo: Descriptions.slug,
      filterOptions: {
        type: {
          contains: HardwareDescriptionPrefix,
        },
      },
      required: true,
    },
    {
      name: "status",
      type: "select",
      options: DeviceStatus,
      required: true,
    },
    {
      name: "public",
      type: "checkbox",
      label: "Display on Public Inventory",
      defaultValue: true,
      required: true,
    },
    {
      name: "model",
      type: "text"
    },
    {
      name: "originalValue",
      type: "number"
    },
    {
      name: "serial",
      type: "text",
    },
    {
      name: "mac",
      label: "MAC Address",
      type: "text",
      validate: (val) => {
        let valid = typeof val === "undefined" || MACAddressRegex.test(val);

        if (valid) {
          return true;
        } else {
          return "This is not a valid MAC address!";
        }
      },
    },
    {
      name: "sponsor",
      type: "text"
    },
    {
      name: "purchaser",
      type: "text"
    },
    {
      name: "owner",
      type: "text"
    },
    {
      name: "umdSerial",
      type: "text",
    },
    {
      name: "xrTag",
      type: "text"
    },
    {
      name: "location",
      type: "text"
    },
    {
      name: "dateReceived",
      type: "date"
    },
    {
      name: "dateReturned",
      type: "date"
    },
    {
      name: "lastAudited",
      type: "date"
    },
    {
      name: "items",
      type: "array",
      fields: [
        {
          name: "name",
          type: "text",
          required: true,
        },
        {
          name: "quantity",
          type: "number",
          required: true,
          defaultValue: 1
        },
        {
          name: "modelNumber",
          type: "text"
        },
        {
          name: "serialNumber",
          type: "text"
        },
        {
          name: "xrTag",
          type: "text"
        },
        {
          name: "notes",
          type: "textarea"
        }
      ]
    },
    {
      name: "wol",
      type: "ui",
      admin: {
        condition: (data) => !!data.macAddress,
        components: {
          Field: createActionButton({
            title: "Send WOL Packet",
            postUrl: "/api/devices/:id/wol",
          }),
        },
      },
    },
  ],
};

export default Devices;
