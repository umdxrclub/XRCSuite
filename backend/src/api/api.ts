import { Request, Response } from "express";
import { API } from "xrc-schema";

/**
 * Represents an API schema with a version name and routes. Each API has all of
 * its paths prepended with the version to avoid conflicts with different API
 * versions and to allow for hosting multiple API versions at the same time for
 * legacy devices.
 */
export interface API {
    version: string
    routes: APIRoute[]
}

/**
 * Represents an API route on a specified path. Each route has a associated path,
 * method, and handler for the route.
 */
export interface APIRoute {
    method: 'all' | 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head',
    path: string,
    handler: (req: Request, res: Response) => Promise<void>,
}

/**
 * Extracts ONLY the keys present in an interface to a new object. Useful for
 * removing extra data that may be returned by abstraction.
 *
 * @param obj The object to extract data from
 * @returns The extracted object
 */
export function extract<T>(obj: T): T {
    var extractedObj: T = {} as T;
    const keys = Object.keys(obj) as Array<keyof T>
    keys.forEach(property => {
        extractedObj[property] = obj[property];
    })

    return extractedObj;
}

type APIRouteHandler<T> = (req: Request, res: Response) => Promise<void>

export type APIImplementation<A extends API.APISchema> = {
    version: string,
    schema: {
        [method in keyof A]: {
            [path in keyof A[method]]: APIRouteHandler<API.ConfigCast<A[method][path]>["parameters"]>
        }
    }
}

