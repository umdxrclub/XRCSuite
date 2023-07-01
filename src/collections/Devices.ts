import { CollectionConfig } from "payload/types";
import { createActionButton } from "../components/ActionButton";
import DeviceInventoryEndpoint from "../endpoints/Devices/DeviceInventory";
import WakeOnLANEndpoint from "../endpoints/Devices/WakeOnLAN";
import { CollectionSlugs } from "../slugs";
import { DeviceStatus, HardwareDescriptionPrefix } from "../types/XRCTypes";
import Descriptions from "./Descriptions";
import { useAsRowTitle } from "../util/payload";

const MACAddressRegex = /^[a-fA-F0-9]{2}(:[a-fA-F0-9]{2}){5}$/;

const Devices: CollectionConfig = {
  slug: CollectionSlugs.Devices,
  admin: {
    useAsTitle: "name",
    group: "Inventory",
    defaultColumns: [
      "name",
      "status",
      "lastAudited",
      "xrTag",
      "departmentTag",
      "public",
    ],
  },
  endpoints: [DeviceInventoryEndpoint, WakeOnLANEndpoint],
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "description",
      type: "relationship",
      relationTo: Descriptions.slug,
      filterOptions: {
        type: {
          contains: HardwareDescriptionPrefix,
        },
      },
    },
    {
      name: "public",
      type: "checkbox",
      label: "Display on Public Inventory",
      defaultValue: true,
      required: true,
    },
    {
      name: "status",
      type: "select",
      options: DeviceStatus,
      required: true,
    },
    {
      name: "serial",
      type: "text",
      label: "Serial Number",
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
      name: "departmentTag",
      type: "text",
    },
    {
      name: "xrTag",
      type: "text",
      label: "XR Tag",
    },
    {
      name: "dateReceived",
      type: "date",
    },
    {
      name: "lastAudited",
      type: "date",
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
          defaultValue: 1,
        },
        {
          name: "serialNumber",
          type: "text",
        },
        {
          name: "departmentTag",
          type: "text"
        },
        {
          name: "xrTag",
          type: "text",
        },
        {
          name: "notes",
          type: "textarea",
        },
      ],
      admin: {
        components: {
          RowLabel: useAsRowTitle("name"),
        },
      },
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
