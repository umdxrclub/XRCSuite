import { Axios } from 'axios';
import { useAxios } from "../util/axios";
import { getXRCHost, XRCHostConfiguration } from "../util/host";
import { Odoo } from '../util/odoo';
import { TerpLink } from '../util/terplink';
import { UMDDirectory } from '../util/umd-directory';
import { EventManager } from './EventManager';
import { LabManager } from './Lab';
import { MemberManager } from './MemberManager';

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