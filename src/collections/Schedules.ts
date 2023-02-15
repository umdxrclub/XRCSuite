import { CollectionConfig, Field } from "payload/types";
import createDayScheduleField from "../blocks/schedules";
import { CollectionSlugs } from "../slugs";

const Days = [ 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday' ]

function makeDayFields(): Field[] {
    let fields: Field[] = Days.map(d => createDayScheduleField({ name: d }))
    return fields;
}

const Schedules: CollectionConfig = {
    slug: CollectionSlugs.Schedules,
    fields: makeDayFields()
}

export default Schedules;