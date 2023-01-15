import { Axios } from 'axios';
import { UMDVerificationManager } from '../endpoints/Members/UMDVerification';
import { useAxios } from "../util/axios";
import { Odoo } from '../util/odoo';
import { TerpLink } from '../util/terplink';
import { UMDDirectory } from '../util/umd-directory';

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

export default XRC;