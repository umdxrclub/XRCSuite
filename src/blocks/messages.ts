import { BlockField } from "payload/types";
import Banner from "./messages/Banner";
import LinkButtons from "./messages/LinkButtons";
import Device from "./messages/Device";
import Embed from "./messages/Embed";
import Image from "./messages/Image";
import Message from "./messages/Message";
import Poll from "./messages/Poll";
import Profile from "./messages/Profile";
import RoleSelect from "./messages/RoleSelect";
import Event from "./messages/Event";


function createDiscordMessageField(field: Omit<BlockField, "type" | "blocks">): BlockField {
    return {
        ...field,
        type: "blocks",
        blocks: [
            Message, 
            Banner,
            RoleSelect,
            Profile, 
            Device,
            Poll,
            Event,
            LinkButtons, 
            Image, 
            Embed 
        ]
    }
}

export default createDiscordMessageField;