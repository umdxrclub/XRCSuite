import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import { FileCookieStore } from "tough-cookie-file-store"

const jar = new CookieJar(new FileCookieStore("./cookies.json"));
const axi = wrapper(axios.create({
    jar: jar
}))

axi.defaults.withCredentials = true;
axi.defaults.headers = {
    ...axi.defaults.headers,
    common: {
        ...axi.defaults.headers.common,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:97.0) Gecko/20100101 Firefox/97.0",
    }
}

export function useAxios() {
    return axi;
}