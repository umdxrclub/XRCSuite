import { labRoute } from './lab';
import { API } from "../api";
import { EventsRoutes } from './events';

export const API_V1: API = {
    basePath: "v1",
    routes: [
        labRoute,
        ...EventsRoutes,
    ],
    responseHandler: async (req, res, routeRes) => {
        await res.json(routeRes);
    }
}