import { CollectionAfterChangeHook } from "payload/types";
import { updateRolesSelectMessage } from "../../collections/util/RolesUtil";
import { Role } from "../../types/PayloadSchema";

const RolesChangeHook: CollectionAfterChangeHook = async (args) => {
    await updateRolesSelectMessage()
}

export default RolesChangeHook;