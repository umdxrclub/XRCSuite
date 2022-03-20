import { APIRoute } from "../../api";
import { uid_get, uid_post } from "./uid";

export const auth: APIRoute[] = [uid_get, uid_post]