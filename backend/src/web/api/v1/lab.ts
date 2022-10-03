import XRC from '../../../data/XRC';
import { APIRoute } from '../api';

const lab: APIRoute = {
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

const lab_checkin: APIRoute = {
    "path": "lab/checkin",
    handlers: {
        "post": async (req, res) => {
            return {
                success: true,
                data: null
            }
        }
    }
}

export const LabRoutes: APIRoute[] = [lab, lab_checkin]