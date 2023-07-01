import payload from "payload";
import { getDocumentId } from "../../util/payload";
import { Description, Device } from "../../types/PayloadSchema";
import { resolveDocument } from "../../server/payload-backend";

export type DeviceListing = {
    description: Description,
    quantity: Partial<Record<Device["status"], number>>
}

export async function getPublicDevices(): Promise<Device[]> {
    // Find all devices that are publicly listed.
    let devices = await payload.find({
        collection: "devices",
        where: {
            public: {
                equals: true
            }
        }
    })

    return devices.docs;
}

export async function getPublicDeviceInventory() {
    // Find all devices that are publicly listed.
    let devices = await getPublicDevices()
    var inventory: DeviceInventory = []

    // On the XR Club website, we want to group the devices by their type; that is,
    // we want to group them by their description. Thus, we'll create a map that
    // maps from description ids to device listings.
    let descriptionMap = new Map<string, DeviceListing>();
    for (var device of devices) {
        if (!device.description) continue;

        let descriptionId = getDocumentId(device.description);

        if (!descriptionMap.has(descriptionId)) {
            let description = await resolveDocument(device.description, "descriptions");

            // Add the new description
            descriptionMap.set(descriptionId, {
                description: description,
                quantity: {
                    [device.status]: 1
                }
            })
        } else {
            let listing = descriptionMap.get(descriptionId)!;
            let currentQuantity = listing.quantity[device.status] ?? 0;

            // Increment the quantity of devices with this status.
            descriptionMap.set(descriptionId, {
                ...listing,
                quantity: {
                    ...listing.quantity,
                    [device.status]: currentQuantity + 1
                }
            })
        }
    }

    let deviceKeys = Array.from(descriptionMap.keys());
    let categoryMap = new Map<string, DeviceListing[]>();

    // Build category map.
    deviceKeys.forEach(k => {
        let listing = descriptionMap.get(k)!;
        let listingType = listing.description.type

        let prevListing = categoryMap.get(listingType);
        if (prevListing) {
            prevListing.push(listing)
        } else {
            categoryMap.set(listingType, [listing])
        }
    })

    // Group by category.
    let categoryKeys = Array.from(categoryMap.keys());
    categoryKeys.forEach(k => {
        let listings = categoryMap.get(k)!;
        inventory.push({
            categoryName: k,
            devices: listings
        })

    })

    return inventory;
}

type DeviceInventory = {
    categoryName: string,
    devices: DeviceListing[]
}[]