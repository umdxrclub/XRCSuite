import { updateLabStatusMessage } from "../../globals/util/LabUtil";

export async function createAndUpdateStatusChannelManagers() {
    // Lab
    await updateLabStatusMessage();
}
