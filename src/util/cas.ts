import { AxiosResponse } from "axios";
import parse from "node-html-parser";
import { hotp } from "otplib";
import payload from "payload";
import querystring from "querystring";
import XRC from "./XRC";
import { GlobalSlugs } from "../slugs";
import {
  parseForm,
  queryStringFromForm,
  retryRequest,
  X_WWW_FORM_HEADERS_CONFIG,
} from "./scrape-util";
import { CAS } from "../types/PayloadSchema";
import { Semaphore } from "./semaphore";

function log(msg: string) {
  console.log(`[CASAuthService] ${msg}`);
}

const BASE_AUTH_URL = "https://shib.idm.umd.edu";
// CAS has a "demo" service that just echos your UID. Can be used for auth.
const AUTH_URL =
  "https://shib.idm.umd.edu/shibboleth-idp/profile/cas/login?service=https%3A%2F%2Flogin.umd.edu%2Fdemo%2F";
const DEMO_URL = "https://login.umd.edu/demo/";
export const CAS_LOGIN_URL =
  "https://shib.idm.umd.edu/shibboleth-idp/profile/cas/login";
export const CAS_LOGIN_SSO =
  "https://shib.idm.umd.edu/shibboleth-idp/profile/SAML2/Redirect/SSO";

interface DuoAuthStatus {
  stat: string;
  response: {
    status: string;
    status_code: string;
    result?: string;
    reason?: string;
  };
}

interface DuoAuthResult {
  stat: string;
  response: {
    cookie: string;
    parent: string;
  };
}

/**
 * Generates an authentication code to be sent to Duo. These authentication
 * codes are based on a counter that should be incremented upon a successful
 * authentication attempt.
 */
const HOTP_COUNTER_FILE = ".hotp_counter";
export async function generateAuthCode(hotpSecret: string): Promise<string> {
  let cas = await payload.findGlobal({
    slug: "cas",
  });

  let counter = cas.hotpCounter as number;
  const code = hotp.generate(hotpSecret, counter);
  return code;
}

/**
 * Increments the HOTP counter stored on disk. This should only be called on a
 * successful authentication attempt.
 */
export async function incrementHOTPCounter() {
  // Get existing CAS global
  let cas = await payload.findGlobal({
    slug: "cas",
  });

  // Update CAS Global with incremented counter
  await payload.updateGlobal({
    slug: "cas",
    data: {
      ...cas,
      hotpCounter: cas.hotpCounter + 1,
    },
  });
}

let casSemaphore: Semaphore = new Semaphore(1);

// TODO: Ensure that only one login occurs at at time.
export async function loginWithCAS() {
  if (casSemaphore.numLocks() == 0) {
    console.log("Lock semaphore")
    await casSemaphore.lock();

    // POST: login (shib.idm.umd.edu) -> GET /frame/frameless/v4/auth
    // POST: /frame/frameless/v4/auth

    const axios = XRC.axios;
    const CAS = await payload.findGlobal({
      slug: "cas",
    });

    if (!CAS.duoDeviceName || !CAS.username || !CAS.password || !CAS.hotpSecret)
      throw new Error("Missing CAS credentials, cannot proceed!");

    // First get the initial CAS page. If we're authenticated, this will
    // bring us to the Demo page. Otherwise, this will have the login screen
    // that we can begin auth with.
    const authRes = await axios.get(AUTH_URL);

    // Check if we're already authenticated. If so, return now, no need to
    // go through rest of CAS process.
    if (authRes.request.res.responseUrl == DEMO_URL) {
      log("Already logged in to CAS!");
      return;
    }

    // --- UMD Login Page  ---
    // Not logged into CAS, so we have to authenticate using Duo.
    const authRoot = parse(authRes.data);
    const csrf = authRoot.querySelector("input[name=csrf_token]")?.attributes
      .value;

    if (!csrf) throw new Error("Could not find CSRF!");

    // --- Initial Duo Form Request ---
    // Determine where to POST username/password data
    const formPostUrl =
      BASE_AUTH_URL + authRoot.querySelector("form")!.attributes.action;

    // Construct form data.
    const form = querystring.stringify({
      csrf_token: csrf,
      j_username: CAS.username,
      j_password: CAS.password,
      _eventId_proceed: "",
    });

    // Post username/password form and await Duo data.
    const credentialsRes = await axios.post(
      formPostUrl,
      form,
      X_WWW_FORM_HEADERS_CONFIG
    );

    const credentialsRoot = parse(credentialsRes.data);

    // --- Frameless Auth ---
    const pluginForm = parseForm(credentialsRoot.getElementById("plugin_form"));
    pluginForm.inputs["screen_resolution_width"] = 1920;
    pluginForm.inputs["screen_resolution_height"] = 1080;
    pluginForm.inputs["parent"] = "None";
    pluginForm.inputs["color_depth"] = 24;
    pluginForm.inputs["is_ipad_os"] = false;
    pluginForm.inputs["is_user_verifying_platform_authenticator_available"] =
      true;
    pluginForm.inputs["react_support"] = true;
    const pluginFormQueryString = querystring.stringify(pluginForm.inputs);

    const duoAuthUrl = credentialsRes.request.res.responseUrl as string;
    const framelessRes = await axios.post(
      duoAuthUrl,
      pluginFormQueryString,
      X_WWW_FORM_HEADERS_CONFIG
    );
    const rawHealthcheckUrl = framelessRes.request.res.responseUrl as string;
    const sid = rawHealthcheckUrl.split("sid=")[1].split("&")[0];
    const baseFramelessUrl = rawHealthcheckUrl.split("/v4")[0] + "/v4";
    const baseFrameUrl = baseFramelessUrl.replace("frameless/", "");
    const dataUrl = baseFrameUrl + "/preauth/healthcheck/data?sid=" + sid;
    const xsrf = framelessRes.data.split('xsrf_token": "')[1].split('",')[0];
    const XSRF_HEADERS = {
      headers: {
        ...X_WWW_FORM_HEADERS_CONFIG.headers,
        "X-Xsrftoken": xsrf,
      },
    };

    // --- Health Check ---
    await axios.get(dataUrl, XSRF_HEADERS);

    // --- Return ---
    const returnUrl = baseFrameUrl + `/return?sid=${sid}`;
    const returnRes = await axios.get(returnUrl);

    // --- Return Form ---
    const returnRoot = parse(returnRes.data);
    const returnForm = parseForm(returnRoot.getElementById("plugin_form"));
    returnForm.inputs["screen_resolution_width"] = 1920;
    returnForm.inputs["screen_resolution_height"] = 1080;
    returnForm.inputs["parent"] = "None";
    returnForm.inputs["color_depth"] = 24;
    returnForm.inputs["is_ipad_os"] = false;
    returnForm.inputs["is_user_verifying_platform_authenticator_available"] =
      true;
    returnForm.inputs["react_support"] = true;
    const returnFormQueryString = querystring.stringify(pluginForm.inputs);
    await axios.post(
      returnRes.request.res.responseUrl,
      returnFormQueryString,
      X_WWW_FORM_HEADERS_CONFIG
    );

    // --- Data (see available devices) ---
    const dataPostUrl =
      baseFrameUrl + "/auth/prompt/data?post_auth_action=OIDC_EXIT&sid=" + sid;
    const dataRes = await axios.get(dataPostUrl, XSRF_HEADERS);

    // --- Use Auth Code ---
    const passcode = await generateAuthCode(CAS.hotpSecret);
    const promptRes = await axios.post(
      baseFrameUrl + "/prompt",
      querystring
        .stringify({
          device: "null",
          factor: "Passcode",
          passcode: passcode,
          sid: sid,
        })
        .replace("%2B", "+"),
      XSRF_HEADERS
    );
    if (promptRes.data.stat == "OK") {
      await incrementHOTPCounter();
      const txid = promptRes.data.response.txid;
      const statusRes = await axios.post(
        baseFrameUrl + "/status",
        querystring.stringify({
          txid: txid,
          sid: sid,
        }),
        XSRF_HEADERS
      );
      console.log(statusRes.data);

      const postRes = await axios.post(
        baseFrameUrl + "/oidc/exit",
        querystring.stringify({
          sid: sid,
          txid: txid,
          factor: "Duo+Mobile+Passcode",
          device_key: "",
          _xsrf: xsrf,
          dampen_choice: false,
        })
      );
    }
    console.log("Release semaphore")
  } else {
    console.log("Waiting for CAS semaphore...")
    await casSemaphore.wait()
    console.log("Done CAS wait!")
  }
}

export async function loginWithCASUsingSAML(
  res: AxiosResponse<any, any>
): Promise<AxiosResponse<any, any>> {
  const axios = XRC.axios;
  var root = parse(res.data);

  // Check if the page is asking for a login, or is simply wanting to redirect
  if (root.querySelector(`input[name=csrf_token]`) != null) {
    // Not logged in yet, so login now.
    console.log("CAS Login required for SAML, logging in now...");
    await loginWithCAS();

    // Retry the SAML request, it'll be intercepted again by the axios handler
    return await retryRequest(res);
  }

  // Redirect
  let postUrl = root.querySelector("form")!.attributes.action;
  let form = queryStringFromForm(root.querySelector("form")!);
  let forwardRes = await axios.post(postUrl, form, X_WWW_FORM_HEADERS_CONFIG);

  return forwardRes;
}
