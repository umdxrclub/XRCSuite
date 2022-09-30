import XRC from '../../../data/XRC';
import { APIRoute } from '../api';

export const labRoute: APIRoute = {
    path: "lab",
    handlers: {
        "get": async (req, res) => {
            return {
                success: true,
                data: XRC.lab.getLabStatus()
            }
        }
    }
}