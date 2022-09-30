import { XRCSchema } from "@xrc/XRCSchema";
import { Request, Response } from "express";

/**
 * Represents an API schema with a version name and routes. Each API has all of
 * its paths prepended with the version to avoid conflicts with different API
 * versions and to allow for hosting multiple API versions at the same time for
 * legacy devices.
 */
export interface API {
    basePath: string
    routes: APIRoute[],
    responseHandler: ResponseHandler 
}

type HTTPMethod = 'all' | 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head';
type RequestHandler = (req: Request, res: Response) => Promise<XRCSchema.Response>
type ResponseHandler = (req: Request, res: Response, routeResponse: XRCSchema.Response) => Promise<void>

/**
 * Represents an API route on a specified path. Each route has a associated path
 * and handlers for that route.
 */
export interface APIRoute {
    path: string,
    handlers: Partial<Record<HTTPMethod, RequestHandler>>
}
