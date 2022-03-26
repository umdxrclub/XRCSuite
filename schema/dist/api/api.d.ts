import { AxiosResponse } from "axios";
import V1_SCHEMA from "./v1-schema";
export declare type HTTPMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head';
export declare type EMPTY = {};
export declare type RouteConfig = {
    parameters: {
        path?: {
            [key: string]: string;
        };
        query?: {
            [query: string]: string | number;
        };
        data?: any;
    };
    response: any;
};
declare type HTTPMethodRoutes = {
    [path in string]: RouteConfig;
};
export declare type APISchema = {
    [method in HTTPMethod]?: HTTPMethodRoutes;
};
export declare type ConfigCast<T> = T & HTTPMethodRoutes;
/**
 * Provides methods for communicating with a REST API given some APISchema type.
 * The APISchema generic is used so that the get/post/etc. methods will be typed
 * checked against the schema. This allows your IDE to force you to specify
 * valid endpoints and provide all the required parameters.
 */
declare class API<A extends APISchema> {
    rootPath: string;
    constructor(rootPath: string);
    /**
     * Sends an HTTP request to a specified endpoint on the API's schema. This
     * will return the response object that has the returned data type of the
     * endpoint.
     *
     * @param method The HTTP method to use
     * @param path The path to post to
     * @param params The required request parameters
     * @returns Whatever the path returns.
     */
    request<M extends HTTPMethod, P extends keyof A[M]>(method: M, path: P, params: ConfigCast<A[M]>[P]["parameters"]): Promise<AxiosResponse<ConfigCast<A[M]>[P]["response"]>>;
    get<P extends keyof A["get"]>(path: P, params: ConfigCast<A["get"]>[P]["parameters"]): Promise<AxiosResponse<ConfigCast<A["get"]>[P]["response"]>>;
    post<P extends keyof A["post"]>(path: P, params: ConfigCast<A["post"]>[P]["parameters"]): Promise<AxiosResponse<ConfigCast<A["post"]>[P]["response"]>>;
    delete<P extends keyof A["delete"]>(path: P, params: ConfigCast<A["delete"]>[P]["parameters"]): Promise<AxiosResponse<ConfigCast<A["delete"]>[P]["response"]>>;
}
export declare const XRCAPI: {
    v1: API<V1_SCHEMA>;
    v1_dev: API<V1_SCHEMA>;
};
export {};
