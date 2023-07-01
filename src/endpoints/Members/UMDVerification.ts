import payload from "payload";
import { Endpoint } from "payload/dist/config/types";
import { env } from "process";
import { v4 as uuidv4 } from "uuid";
import XRC from "../../server/XRC";

const CASLoginBaseUrl =
  "https://shib.idm.umd.edu/shibboleth-idp/profile/cas/login";
const CASServiceValidateUrl =
  "https://shib.idm.umd.edu/shibboleth-idp/profile/cas/serviceValidate";
const CASCallbackUrlPath = "/api/members/verify/umd";

type UMDVerificationResult = {
  directoryId: string;
  foundMember: boolean;
};

type UMDVerificationTicket = {
  serviceUrl: string;
  promise: Promise<UMDVerificationResult>;
  resolve: (result: UMDVerificationResult) => void;
};

/**
 * This manages the creation of UMD verification urls. A url is created when a
 * user requests to link their Discord account to their UMD directory id.
 */
export class UMDVerificationManager {
  /**
   * Contains verification UUIDs to corresponding Discord user ids and vice versa.
   */
  private _idMap: Map<string, string> = new Map();

  /**
   * Contains UUID verification ids to the corresponding service url and
   * verification promise.
   */
  private _ticketMap: Map<string, UMDVerificationTicket> = new Map();

  createAuthenticationUrl(discordId: string): string {
    let id = this._idMap.get(discordId);
    if (id) {
      // Don't recreate a new authentication URL, just return the existing
      // one.
      return id;
    } else {
      let uuid = uuidv4();
      this._idMap.set(discordId, uuid);
      this._idMap.set(uuid, discordId);

      let serviceUrl = encodeURI(
        env.PUBLIC_URL + CASCallbackUrlPath + `?id=${uuid}`
      );
      let verificationUrl = CASLoginBaseUrl + `?service=${serviceUrl}`;

      // Create a promise
      let promise: Promise<UMDVerificationResult> = new Promise(
        (resolve, reject) => {
          this._ticketMap.set(uuid, {
            serviceUrl,
            promise: promise,
            resolve,
          });
        }
      );

      return verificationUrl;
    }
  }

  async verifyUrl(id: string, ticket: string): Promise<void> {
    let verificationTicket = this._ticketMap.get(id);
    if (verificationTicket) {
      let serviceUrl = verificationTicket.serviceUrl;
      let validateUrl =
        CASServiceValidateUrl + `?service=${serviceUrl}&ticket=${ticket}`;
      let res = await XRC.axios.get(validateUrl);
      if (res.status == 200) {
        // Parse UID
        const re = /<cas:uid>(.*)<\/cas:uid>/;
        let match = re.exec(res.data);
        if (!match) throw new Error("Could not find UID within CASresponse!");
        let uid = match[1];

        // Update member in database
        let discordId = this._idMap.get(id);

        // Since all UMD emails are in the format UID@(terpmail|umd).edu,
        // we can search the member table for a member with an email
        // beginning with "UID@" and update their profile with their
        // Discord profile.

        let members = await payload.find({
          collection: "members",
          where: {
            email: {
              contains: `${uid}@`,
            },
          },
        });

        // See if a member has been found, and if so, add the discord id.
        let foundMember = members.totalDocs == 1;
        if (foundMember) {
          let member = members.docs[0];
          await payload.update({
            collection: "members",
            id: member.id,
            data: {
              integrations: {
                discord: discordId,
              },
            },
          });
        }

        verificationTicket.resolve({
          directoryId: uid,
          foundMember: foundMember,
        });
      }
    } else {
      throw new Error(`The id ${id} could not be found!`);
    }
  }

  async waitForVerify(discordId: string): Promise<UMDVerificationResult> {
    let uuid = this._idMap.get(discordId);
    if (uuid) {
      let ticket = await this._ticketMap.get(uuid);
      if (!ticket) throw new Error("Ticket wasn't found!")
      return await ticket.promise;
    } else {
      throw new Error("Could not find member with discord id: " + discordId);
    }
  }
}

const UMDVerificationEndpoint: Endpoint = {
  path: "/verify/umd",
  method: "get",
  handler: async (req, res, next) => {
    let { id, ticket } = req.query;

    // Check for required parameters
    if (typeof id !== "string" || typeof ticket !== "string") {
      res.status(400).send({ error: "missing parameter" });
      return;
    }

    await XRC.umd.verifyUrl(id, ticket);
    res.redirect("https://google.com");
  },
};

export default UMDVerificationEndpoint;
