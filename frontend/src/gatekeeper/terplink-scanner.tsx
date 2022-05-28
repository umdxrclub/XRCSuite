import { getXRC } from "../xrc-api";
import { GatekeeperResolver, GatekeeperScanner, ResolverResult } from "./gatekeeper-scanner"

export type TerpLinkScannerProps = {
    eventcode: string
}

export const TerpLinkScanner: React.FC<TerpLinkScannerProps> = ({eventcode}) => {

    const resolve: GatekeeperResolver = async (method, value) => {
        var result: ResolverResult | null = null;
        
        // Attempt to check the member in.
        try {
            const res = await getXRC().post("/terplink/:eventcode/checkin", {
              path: { eventcode: eventcode! },
              query: { instanceId: value },
            });
            const checkedInMember = res.data;
            result = {
                name: checkedInMember.name,
                type: "checkin"
            }
        } catch {

        }
        
        return result;
    };

    return <GatekeeperScanner resolve={resolve} />
}