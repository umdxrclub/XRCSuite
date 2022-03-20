"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XRCSchema = void 0;
var XRCSchema;
(function (XRCSchema) {
    let DEVICE_TYPE;
    (function (DEVICE_TYPE) {
        DEVICE_TYPE[DEVICE_TYPE["OTHER"] = 0] = "OTHER";
        DEVICE_TYPE[DEVICE_TYPE["VR_HEADSET"] = 1] = "VR_HEADSET";
        DEVICE_TYPE[DEVICE_TYPE["AR_HEADSET"] = 2] = "AR_HEADSET";
        DEVICE_TYPE[DEVICE_TYPE["SMARTPHONE"] = 3] = "SMARTPHONE";
        DEVICE_TYPE[DEVICE_TYPE["ACCESSORY"] = 4] = "ACCESSORY";
    })(DEVICE_TYPE = XRCSchema.DEVICE_TYPE || (XRCSchema.DEVICE_TYPE = {}));
})(XRCSchema = exports.XRCSchema || (exports.XRCSchema = {}));
