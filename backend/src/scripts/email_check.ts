import { TerpLink } from "../src/util/terplink"

const UMD_EMAIL_DOMAIN = "@umd.edu";

(async () => {
    const tl = TerpLink.singleton;

    var page = await tl.getRosterPage(1);
    const lastPage = parseInt(page.lastPage)
    let memberPromises: Promise<any>[] = []

    for (var i = 1; i <= lastPage; i++) {
        console.log(`"Processing Page #${i}/${lastPage}"`)
        page.members.forEach(member => {
            memberPromises.push((async () => {
                const email = await tl.getEmailFromCommunityId(member.communityId)
                if (!email.endsWith(UMD_EMAIL_DOMAIN))
                    console.error(`${member.name} does NOT have an UMD email: ${email}`)
            })())
        })

        page = await tl.getRosterPage(i+1);
    }

    await Promise.all(memberPromises)
    console.log("All emails checked!")
})();