import { LabManager } from './Lab';
import { useAxios } from "../util/axios";
import { getXRCHost, XRCHostConfiguration } from "../util/host";
import { UMDDirectory } from '../util/umd-directory';
import { Axios } from 'axios';
import { MemberManager } from './MemberManager';
import { TerpLink } from '../util/terplink';
import { EventManager } from './EventManager';
import { Odoo } from '../util/odoo';

class XRCManager
{
    public axios: Axios
    public host: XRCHostConfiguration
    public lab: LabManager
    public directory: UMDDirectory
    public members: MemberManager
    public events: EventManager
    public terplink: TerpLink
    public odoo: Odoo

    constructor() {
        this.axios = useAxios();
        this.host = getXRCHost();
        this.directory = new UMDDirectory(this.axios);
        this.members = new MemberManager()
        this.terplink = new TerpLink(this.axios);
        this.events = new EventManager(this.terplink);
        this.lab = new LabManager(this.events);
        this.odoo = new Odoo()
    }

}

const XRC = new XRCManager();

export default XRC;