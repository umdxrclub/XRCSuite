import parse from "node-html-parser";
import { X_WWW_FORM_HEADERS_CONFIG, getValueOfInputFieldWithName } from "./scrape-util";
import { useAxios } from "./shared-axios";
import { useXRCHost } from "./xrc-host-file";
import fs from "fs/promises"
import { hotp } from "otplib";
import querystring from "querystring"

function log(msg: string) {
    console.log(`[CASAuthService] ${msg}`)
}

const BASE_AUTH_URL = "https://shib.idm.umd.edu"
// CAS has a "demo" service that just echos your UID. Can be used for auth.
const AUTH_URL = "https://shib.idm.umd.edu/shibboleth-idp/profile/cas/login?service=https%3A%2F%2Flogin.umd.edu%2Fdemo%2F"
const DEMO_URL = "https://login.umd.edu/demo/"
export const CAS_LOGIN_URLS = [
    "https://shib.idm.umd.edu/shibboleth-idp/profile/cas/login",
    "https://shib.idm.umd.edu/shibboleth-idp/profile/SAML2/Redirect/SSO"
]

interface DuoAuthStatus {
    stat: string,
    response: {
        status: string,
        status_code: string
        result?: string
        reason?: string
    }
}

interface DuoAuthResult {
    stat: string,
    response: {
        cookie: string,
        parent: string
    }
}

/**
 * Generates an authentication code to be sent to Duo. These authentication
 * codes are based on a counter that should be incremented upon a successful
 * authentication attempt.
 */
 const HOTP_COUNTER_FILE = ".hotp_counter";
 export async function generateAuthCode(): Promise<string> {
     // Try to read the counter file to generate the code
     try {
         var counter = parseInt(await fs.readFile(HOTP_COUNTER_FILE, "utf-8"));
     } catch (e) {
         // Write the new counter file since it doesn't exist
         await fs.writeFile(HOTP_COUNTER_FILE, "0");
         var counter = 0;
     }
 
     const host = useXRCHost();
     const code = hotp.generate(host.cas.hotpSecret, counter);
     return code;
 }
 
 /**
  * Increments the HOTP counter stored on disk. This should only be called on a
  * successful authentication attempt.
  */
 export async function incrementHOTPCounter() {
     try {
         var counter = parseInt(await fs.readFile(HOTP_COUNTER_FILE, "utf-8"));
     } catch (e) {
         console.error("Trying to increment the HOTP counter file when it does not exist!");
         return;
     }
 
     // Write the incremented value to the file.
     await fs.writeFile(HOTP_COUNTER_FILE, (counter + 1).toString());
 }

export async function loginWithCAS() {
    const axios = useAxios();
    const host = useXRCHost();

    // First get the initial CAS page. If we're authenticated, this will
    // bring us to the Demo page. Otherwise, this will have the login screen
    // that we can begin auth with.
    const authRes = await axios.get(AUTH_URL);

    // Check if we're already authenticated. If so, return now, no need to
    // go through rest of CAS process.
    if (authRes.request.res.responseUrl == DEMO_URL) {
        log("Already logged in to CAS!")
        return;
    }

    // Not logged into CAS, so we have to authenticate using Duo.
    const authRoot = parse(authRes.data);
    const csrf = authRoot.querySelector("input[name=csrf_token]")?.attributes.value

    if (!csrf)
        throw new Error("Could not find CSRF!");

    log("(1/9) Got CSRF");

    // Determine where to POST username/password data
    const formPostUrl = BASE_AUTH_URL + authRoot.querySelector("form")!.attributes.action

    // Construct form data.
    const form = querystring.stringify({
        csrf_token: csrf,
        j_username: host.cas.username,
        j_password: host.cas.password,
        _eventId_proceed: ""
    })

    // Post username/password form and await Duo data.
    const credentialsRes = await axios.post(formPostUrl, form, X_WWW_FORM_HEADERS_CONFIG)
    const credentialsRoot = parse(credentialsRes.data)

    log("(2/9) Got Duo form");

    // Extract relevant Duo information from CAS.
    const duo_iframe = credentialsRoot.querySelector("#duo_iframe")!;
    const duo_host = duo_iframe.attributes["data-host"];
    const duo_sig_request = duo_iframe.attributes["data-sig-request"]; // TX|...
    var [ tx, app ] = duo_sig_request.split(":")
    const duo_version = "2.6"
    const csrf_token = getValueOfInputFieldWithName(credentialsRoot, "csrf_token")

    // Create query with relevant information.
    const duo_auth_query = querystring.stringify({
        tx: tx,
        v: duo_version,
        parent: credentialsRes.request.res.responseUrl
    })

    // Create the auth url using the query.
    const duoAuthUrl = `https://${duo_host}/frame/web/v1/auth?${duo_auth_query}`
    const duoGetRes = await axios.get(duoAuthUrl);

    log("(3/9) Got Duo Auth frame")

    const duoGetRoot = parse(duoGetRes.data);
    const parent = getValueOfInputFieldWithName(duoGetRoot, "parent");

    // Create the form data.
    const duoForm = querystring.stringify({
        tx: tx,
        parent: parent,
        java_version: "",
        flash_version: "",
        screen_resolution_width: 1920,
        screen_resolution_height: 1080,
        color_depth: 24,
        ch_ua_brands: "",
        ch_ua_mobile: "",
        ch_ua_platform: "",
        ch_ua_platform_version: "",
        ch_ua_full_version: "",
        is_cef_browser: false,
        is_ipad_os: false,
        is_ie_compatibility_mode: "",
        is_user_verifying_platform_authenticator_available: true,
        user_verifying_platform_authenticator_available_error: "",
        acting_ie_version: "",
        react_support: true,
        react_support_error_message: ""
    })

    const duoPostRes = await axios.post(duoAuthUrl, duoForm, X_WWW_FORM_HEADERS_CONFIG);

    const duoPostRoot = parse(duoPostRes.data);
    const xsrf = getValueOfInputFieldWithName(duoPostRoot, "_xsrf");
    var sid = getValueOfInputFieldWithName(duoPostRoot, "sid");
    const txid = getValueOfInputFieldWithName(duoPostRoot, "txid")
    const akey = getValueOfInputFieldWithName(duoPostRoot, "akey")
    const responseTimeout = getValueOfInputFieldWithName(duoPostRoot, "response_timeout")
    const postParent = getValueOfInputFieldWithName(duoPostRoot, "parent")
    const duoAppUrl = getValueOfInputFieldWithName(duoPostRoot, "duo_app_url")
    const ehServiceUrl = getValueOfInputFieldWithName(duoPostRoot, "eh_service_url")
    const ehDownloadLink = getValueOfInputFieldWithName(duoPostRoot, "eh_download_link")
    const isSilentCollection = getValueOfInputFieldWithName(duoPostRoot, "is_silent_collection")

    const duoPostForm = querystring.stringify({
        sid: sid,
        akey: akey,
        txid: txid,
        response_timeout: responseTimeout,
        parent: postParent,
        duo_app_url: duoAppUrl,
        eh_service_url: ehServiceUrl,
        eh_download_link: ehDownloadLink,
        _xsrf: xsrf,
        is_silent_collection: isSilentCollection
    })

    log("(4/9) Sent Duo POST")
    const duoPromptRes = await axios.post(duoAuthUrl, duoPostForm, X_WWW_FORM_HEADERS_CONFIG)

    log("(5/9) Sent Prompt POST")

    const duoPromptRoot = parse(duoPromptRes.data)
    sid = getValueOfInputFieldWithName(duoPromptRoot, "sid");
    const pushForm = querystring.stringify({
        sid: sid,
        device: host.cas.device,
        factor: "Passcode",
        passcode: await generateAuthCode(),
        out_of_date: false,
        days_out_of_date: 0,
        days_to_block: "None"
    })

    const pushUrl = `https://${duo_host}/frame/prompt`
    const pushRes = await axios.post(pushUrl, pushForm, X_WWW_FORM_HEADERS_CONFIG)
    log("(6/9) Sent authentication request")

    // Wait for push fulfill
    const statusUrl = `https://${duo_host}/frame/status`
    const pushTxid = pushRes.data.response.txid;
    const statusForm = querystring.stringify({
        sid: sid,
        txid: pushTxid
    })

    var status: DuoAuthStatus
    for (var i = 0; i < 2; i++) {
        const statusRes = await axios.post(statusUrl, statusForm, X_WWW_FORM_HEADERS_CONFIG)
        status = statusRes.data as DuoAuthStatus
        log("(7/9) Pending Auth: " + status.response.status)
    }

    if (status!.response.result == "FAILURE")
        throw new Error("Duo authentication failed!")

    // Final auth stage
    const confirmUrl = `https://${duo_host}/frame/status/${pushTxid}`
    const confirmForm = querystring.stringify({
        sid: sid
    })

    const confirmRes = await axios.post(confirmUrl, confirmForm, X_WWW_FORM_HEADERS_CONFIG);
    const result = confirmRes.data as DuoAuthResult;

    log("(8/9) Got Duo Auth result")

    if (result.stat != "OK")
        throw new Error("Auth failed!")

    const finalAuthForm = querystring.stringify({
        csrf_token: csrf_token,
        _eventId: "proceed",
        sig_response: `${result.response.cookie}:${app}`
    })

    const finalRes = await axios.post(result.response.parent, finalAuthForm, X_WWW_FORM_HEADERS_CONFIG)

    /* Increment HOTP counter if successful auth */
    if (finalRes.status == 200)
        await incrementHOTPCounter();

    log("(9/9) Completed auth!")
}