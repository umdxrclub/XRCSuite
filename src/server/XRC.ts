import { Axios } from 'axios';
import { UMDVerificationManager } from '../endpoints/Members/UMDVerification';
import { useAxios } from "./axios";
import { Odoo } from './odoo';
import { TerpLink } from './terplink';
import { UMDDirectory } from './umd-directory';

class XRCManager
{
    public directory: UMDDirectory
    public axios: Axios
    public umd: UMDVerificationManager
    public terplink: TerpLink
    public odoo: Odoo

    constructor() {
        this.axios = useAxios();
        this.directory = new UMDDirectory(this.axios);
        this.terplink = new TerpLink(this.axios);
        this.odoo = new Odoo();
        this.umd = new UMDVerificationManager();
    }

}

const XRC = new XRCManager();

export function useTerpLink() {
    return XRC.terplink;
}

export function useDirectory() {
    return XRC.directory;
}

export function useOdoo() {
    return XRC.odoo;
}

export function useUMDVerifier() {
    return XRC.umd;
}

export default XRC;