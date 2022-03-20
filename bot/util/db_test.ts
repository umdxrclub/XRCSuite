import { useXRDatabase } from "../src/data/xrdata";

const data = useXRDatabase();

(async () => {
    await data.init();

    (await data.getAllMembers()).forEach(member => console.log(member.discord_id));

    // await data.addMember({
    //     discord_id: "12345", // required,
    //     name: "Damian Figueroa",
    // })

    // await data.updateMember("12345", {
    //     uid: "djfigs",
    //     email: "djfigs10@gmail.com",
    //     scoresaber_id: "1234567890"
    // });

    // await data.findMember("12345");

    // await data.removeMember("12345");
})();