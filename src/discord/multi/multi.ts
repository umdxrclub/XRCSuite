import { stat } from "fs";
import payload from "payload";
import { updateLabStatusMessage } from "../../globals/util/LabUtil";
import { GlobalSlugs } from "../../slugs";
import { Bot } from "../../types/PayloadSchema";
import { XRCSuiteStatusChannelType } from "../../types/XRCTypes";
import { getGuildChannelById, updateGetStartedMessage } from "../util";
import MultiMessageManager from "./MultiMessageManager";



export async function createAndUpdateStatusChannelManagers() {
    // Lab
    await updateLabStatusMessage();
}
