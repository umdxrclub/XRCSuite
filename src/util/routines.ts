import { postLeadershipInDiscord } from "../collections/util/MembersUtil"

const Routines: { name: string, invoke: () => void }[] = [
    {
        name: "leadership",
        invoke: postLeadershipInDiscord
    }
]

const RoutineMap: Map<string, () => void> = new Map(Routines.map(r => [r.name, r.invoke]))

export default RoutineMap;