import axios from "axios";
import crypto from "crypto";
import { CookieJar } from "tough-cookie";
import { FileCookieStore } from "tough-cookie-file-store";
import { CAS_LOGIN_SSO, CAS_LOGIN_URL, loginWithCAS, loginWithCASUsingSAML } from "./cas";
import { wasRequestRedirectedTo } from "./scrape-util";
import { HttpCookieAgent, HttpsCookieAgent } from 'http-cookie-agent/http';

const DEBUG = false

const jar = new CookieJar(new FileCookieStore("./cookies.json"));
const sharedAxios = axios.create({
    httpAgent: new HttpCookieAgent({ cookies: { jar } }),
    httpsAgent: new HttpsCookieAgent({ cookies: { jar }, secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT })
})

sharedAxios.defaults.withCredentials = true;

// Add seemingly legit User-Agent for CAS requests
sharedAxios.defaults.headers = {
    ...sharedAxios.defaults.headers,
    common: {
        ...sharedAxios.defaults.headers.common,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:103.0) Gecko/20100101 Firefox/103.0",
    }
}

// Check for CAS Login pages so that we can login to them, if needed.
sharedAxios.interceptors.response.use(async res => {
    var retryRequest = false
    let reqUrl = res.config.url!
    let responseUrl = res.request.res.responseUrl as string

    if (DEBUG)
        console.log(`RES (${res.status}): ${responseUrl}, REQ: ${reqUrl}`)

    // See if the request was redirected to the CAS login page, and if so, login
    if (wasRequestRedirectedTo(reqUrl, responseUrl, CAS_LOGIN_URL)) {
        console.log("Request redirected to CAS Login Page, logging in...")
        await loginWithCAS();

        // Retry the request with the CAS login
        retryRequest = true
    } else if (wasRequestRedirectedTo(reqUrl, responseUrl, CAS_LOGIN_SSO)) {
        console.log("Request redirected to CAS SAML Login Page, logging in...")
        res = await loginWithCASUsingSAML(res);
    }

    if (retryRequest) {
        console.log("Retrying request...")
        let config = res.config
        config.httpAgent = undefined
        config.httpsAgent = undefined
        return await sharedAxios.request(config);
    } else {
        return res;
    }
})

export function useAxios() {
    return sharedAxios;
}