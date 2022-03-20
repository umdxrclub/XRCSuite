import axios, { AxiosResponse } from "axios";
import V1_SCHEMA from "./v1";

export type HTTPMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head';
export type EMPTY = {};

type APIMethodPaths<A extends APISchema, M extends HTTPMethod> = keyof A[M];

type RouteConfig = {
    parameters: {
        path?: {
            [key: string]: string
        },
        query?: {
            [query: string]: string
        },
        data?: any
    },
    response: any
}

type HTTPMethodRoutes = {
    [path in string]: RouteConfig
}

export type APISchema = {
    [method in HTTPMethod]?: HTTPMethodRoutes
};

export type ConfigCast<T> = T & HTTPMethodRoutes;

/**
 * Provides methods for communicating with a REST API given some APISchema type.
 * The APISchema generic is used so that the get/post/etc. methods will be typed
 * checked against the schema. This allows your IDE to force you to specify
 * valid endpoints and provide all the required parameters. 
 */
class API<A extends APISchema> {
    
    rootPath: string;

    constructor(rootPath: string) {
        this.rootPath = rootPath;
    }

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
    async request<M extends HTTPMethod, P extends keyof A[M]>(method: M, path: P, params: ConfigCast<A[M]>[P]["parameters"]): Promise<AxiosResponse<ConfigCast<A[M]>[P]["response"]>> {
        var requestUrl = this.rootPath + path as string;
        if (params.path) {
            Object.keys(params.path).forEach(key => {
                requestUrl = requestUrl.replace(`:${key}`, params.path![key]);
            });
        }

        if (params.query) {
            const query = new URLSearchParams();
            Object.keys(params.query).forEach(key => {
                query.append(key, params.query![key]);
            });
            requestUrl += `?${query.toString()}`
        }

        console.log(requestUrl);

        return await axios.request({
            method: method,
            url: requestUrl,
            data: params.data
        })
    }

    async get<P extends keyof A["get"]>(path: P, params: ConfigCast<A["get"]>[P]["parameters"]): Promise<AxiosResponse<ConfigCast<A["get"]>[P]["response"]>> {
        return await this.request("get", path, params);
    }

    async post<P extends keyof A["post"]>(path: P, params: ConfigCast<A["post"]>[P]["parameters"]): Promise<AxiosResponse<ConfigCast<A["post"]>[P]["response"]>> {
        return await this.request("post", path, params);
    }

    async delete<P extends keyof A["delete"]>(path: P, params: ConfigCast<A["delete"]>[P]["response"]): Promise<AxiosResponse<ConfigCast<A["delete"]>[P]["response"]>> {
        return await this.request("delete", path, params);
    }
}

export const xrcv1 = new API<V1_SCHEMA>("https://umdxrc.figsware.net/api/v1");