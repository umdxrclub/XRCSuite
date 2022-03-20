"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.xrcv1 = void 0;
const axios_1 = __importDefault(require("axios"));
class API {
    constructor(rootPath) {
        this.rootPath = rootPath;
    }
    request(method, path, params) {
        return __awaiter(this, void 0, void 0, function* () {
            var requestUrl = this.rootPath + path;
            if (params.path) {
                Object.keys(params.path).forEach(key => {
                    requestUrl = requestUrl.replace(`:${key}`, params.path[key]);
                });
            }
            if (params.query) {
                const query = new URLSearchParams();
                Object.keys(params.query).forEach(key => {
                    query.append(key, params.query[key]);
                });
                requestUrl += `?${query.toString()}`;
            }
            console.log(requestUrl);
            return yield axios_1.default.request({
                method: method,
                url: requestUrl,
                data: params.data
            });
        });
    }
    get(path, params) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.request("get", path, params);
        });
    }
    post(path, params) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.request("post", path, params);
        });
    }
    delete(path, params) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.request("delete", path, params);
        });
    }
}
exports.xrcv1 = new API("https://umdxrc.figsware.net/api/v1");
