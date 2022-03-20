import { AxiosResponse } from "axios";
import V1_SCHEMA from "./v1";
export declare type HTTPMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head';
export declare type EMPTY = {};
declare type RouteConfig = {
    parameters: {
        path?: {
            [key: string]: string;
        };
        query?: {
            [query: string]: string;
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
declare class API<A extends APISchema> {
    rootPath: string;
    constructor(rootPath: string);
    request<M extends HTTPMethod, P extends keyof A[M]>(method: M, path: P, params: ConfigCast<A[M]>[P]["parameters"]): Promise<AxiosResponse<ConfigCast<A[M]>[P]["response"]>>;
    get<P extends keyof A["get"]>(path: P, params: ConfigCast<A["get"]>[P]["parameters"]): Promise<AxiosResponse<ConfigCast<A["get"]>[P]["response"]>>;
    post<P extends keyof A["post"]>(path: P, params: ConfigCast<A["post"]>[P]["parameters"]): Promise<AxiosResponse<ConfigCast<A["post"]>[P]["response"]>>;
    delete<P extends keyof A["delete"]>(path: P, params: ConfigCast<A["delete"]>[P]["response"]): Promise<AxiosResponse<ConfigCast<A["delete"]>[P]["response"]>>;
}
export declare const xrcv1: API<V1_SCHEMA>;
export {};
