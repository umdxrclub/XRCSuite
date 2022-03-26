import { Request, Response } from "express";
import { API } from "xrc-schema";
import { RouteConfig } from "xrc-schema/src/api/api";

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

type APIRouteHandler<T> = (req: Request, res: Response) => Promise<void>

export type APIImplementation<A extends API.APISchema> = {
    version: string,
    schema: {
        [method in keyof A]: {
            [path in keyof A[method]]: APIRouteHandler<API.ConfigCast<A[method][path]>["parameters"]>
        }
    }
}

/**
 * Extracts query parameters from a request
 * @param req 
 * @param query 
 * @returns 
 */
export function getQueryParams<R extends RouteConfig>(req: Request, query: { [key in keyof (R["parameters"]["query"])]: boolean }): { [key in keyof R["parameters"]["query"]]: R["parameters"]["query"][key] } {
    const keys = Object.keys(query) as Array<keyof R["parameters"]["query"]>
    const extractedQuery = {} as any
    keys.forEach(key => {
        if (query[key]) {
            const reqQueryVal = req.query[key as string]
            if (reqQueryVal === undefined)
                throw new Error("Missing key: " + key);

            extractedQuery[key] = reqQueryVal
        } else {
            extractedQuery[key] = undefined
        }
    })
    return extractedQuery
}