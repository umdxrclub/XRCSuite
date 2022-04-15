import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import { FileCookieStore } from "tough-cookie-file-store"
import { CAS_LOGIN_URLS, loginWithCAS } from "./cas"

const jar = new CookieJar(new FileCookieStore("./cookies.json"));
const sharedAxios = wrapper(axios.create({
    jar: jar
}))

sharedAxios.defaults.withCredentials = true;

// Add seemingly legit User-Agent for CAS requests
sharedAxios.defaults.headers = {
    ...sharedAxios.defaults.headers,
    common: {
        ...sharedAxios.defaults.headers.common,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:97.0) Gecko/20100101 Firefox/97.0",
    }
}

// Check for CAS/Terplink Login pages so that we can login to them, if needed.
sharedAxios.interceptors.response.use(async res => {
    let reqUrl = res.config.url
    let responseUrl = res.request.res.responseUrl as string

    // See if the request was redirected to the CAS login page, and if so, login
    const redirectedToCAS = CAS_LOGIN_URLS.find(url => !reqUrl?.startsWith(url) && responseUrl.startsWith(url)) != undefined
    if (redirectedToCAS) {
        console.log("CAS login requested!")
        await loginWithCAS();

        // Retry the request with the CAS login
        console.log("CAS login done, retrying request...")
        res = await axios.request(res.config);
    }

    return res;
})

export function useAxios() {
    return sharedAxios;
}