import { XRCDatabase } from "../data/DatabaseService";
import XRC from "../data/XRC";

(async () => {
    await XRCDatabase.init();

    const tl = XRC.terplink;
    const lab_event = (await tl.getEvent("R9QBQN5"))!;
    console.log("Got Lab Event")
    var page = await tl.getRosterPage(1);
    const lastPage = parseInt(page.lastPage)
    
    let memberPromises: Promise<any>[] = []

    for (var i = 1; i <= lastPage; i++) {
        console.log(`"Processing Page #${i}/${lastPage}"`)
        page.members.forEach(member => {
            memberPromises.push((async () => {
                const email = await tl.getEmailFromCommunityId(member.communityId)
                const tlMember = (await lab_event.lookupMembers(email))[0]
                console.log(tlMember.getName(), tlMember.getMemberId())
                members.push({
                    name: tlMember.getName(),
                    email: email,
                    tl_account_id: tlMember.getMemberId()
                })
            })())
        })

        page = await tl.getRosterPage(i+1);
    }
    
    await Promise.all(memberPromises)
    console.log("Member fetch done!")

    await MODELS.member.bulkCreate(members as any[]);
    console.log("Added all members!")
})();