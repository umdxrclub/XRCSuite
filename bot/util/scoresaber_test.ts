import { getScoreSaberProfile } from "../src/scoresaber"



(async () => {
    const my_scoresaber_id = "76561198138725392"
    const profile = await getScoreSaberProfile(my_scoresaber_id)
    if (profile) {
        console.log(profile)
        console.log(profile.name + " #" + profile.rank)
    }
})()
