import { Request } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { Strategy } from "passport";
import { ParsedQs } from "qs";

export default class CASStrategy extends Strategy {

    private _callbackURL: string

    constructor(callbackURL: string) {
        super();
        this._callbackURL = callbackURL;
        this.name = "umd-cas";
    }

    public authenticate(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, options?: any) {
        const url = req.protocol + "://" + req.get('host');

        if (req.query.ticket) {

        } else {
            // this.redirect(`https://shib.idm.umd.edu/shibboleth-idp/profile/cas/login?service=${url + this._callbackURL}`);
            this.fail("no auth")
        }
    }
}
