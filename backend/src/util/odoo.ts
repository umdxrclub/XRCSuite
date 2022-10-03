import { exec } from "child_process"

export type OdooSigner = {
    id: number,
    partner_name: string,
    state: string,
    signing_date: string
}

type OdooPythonScriptCommand = "get_signers" | "send"

export class Odoo {
    public async getSignersOfContract(templateId: number) {
        return await this.execPythonScript("get_signers", [templateId.toString()]) as OdooSigner[]
    }

    public async sendSignatureRequest(templateId: number, email: string, subject: string, filename: string) {
        await this.execPythonScript("send", [templateId.toString(), email, subject, filename])
    }

    private async execPythonScript(cmd: OdooPythonScriptCommand, args: string[]) {
        return await new Promise<OdooSigner[]>((resolve, reject) => {
            let quoted_args = args.map(arg => `\"${arg}\"`)
            exec(`python ./src/util/odoo.py ${cmd} ${quoted_args.join(" ")}`, (err, stdout, stderr) => {
                if (err) {
                    reject(err);
                } else {
                    try {
                        resolve(JSON.parse(stdout));
                    } catch (e) {
                        reject(e);
                    }
                }
            })
        })
    }
}