import { getXRC } from "../xrc-api";
import { GatekeeperResolver, GatekeeperScanner } from "./gatekeeper-scanner"

export type TerpLinkScannerProps = {
    eventcode: string
}

export const TerpLinkScanner: React.FC<TerpLinkScannerProps> = ({eventcode}) => {

    const resolve: GatekeeperResolver = async (method, value) => {
        var name: string | null = null;
        
        // Attempt to check the member in.
        try {
            const res = await getXRC().post("/terplink/:eventcode/checkin", {
              path: { eventcode: eventcode! },
              query: { instanceId: value },
            });
            const checkedInMember = res.data;
            name = checkedInMember.name;
        } catch {

        }
        
        return name;
    };

    return <GatekeeperScanner resolve={resolve} />
}