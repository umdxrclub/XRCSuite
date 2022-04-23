import { Request, Response } from "express";
import { MODELS } from "../../../data/DatabaseService";
import { respondError, respondSuccess } from "../v1";

/**
 * Searches a member in the database using specified search parameters.
 */
export const member_get = async (req: Request, res: Response) => {
    let foundMember = await MODELS.member.findOne({
        where: {
            ...req.body
        }
    })

    if (foundMember) {
        respondSuccess(res, foundMember);
    } else {
        respondError(res, "Member could not be found!");
    }
}

export const member_patch = async (req: Request, res: Response) => {

}

export const member_delete = async (req: Request, res: Response) => {

}

export const member_post = async (req: Request, res: Response) => {
    try {
        await MODELS.member.create({
            ...req.body
        })

        respondSuccess(res)
    } catch (e) {
        respondError(res, "Could not create member!");
    }
}