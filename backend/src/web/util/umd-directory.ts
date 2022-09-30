import { Axios, AxiosResponse } from "axios";
import parse from "node-html-parser";
import { retryRequest, X_WWW_FORM_HEADERS_CONFIG } from "./scrape-util";
import querystring from "querystring"

type DirectoryResult = {
    name: string,
    email: string
}

const UMD_DIRECTORY_URL = "https://identity.umd.edu/search"

/**
 * Configuration parameters for an advanced search of the UMD directory.
 */
export type AdvancedSearchParameters = {
    firstName: string,
    middleName: string,
    lastName: string,
    email: string,
    workPhone: string,
    department: string,
    faculty: boolean,
    staff: boolean,
    affiliate: boolean,
    student: boolean,
    umd: boolean,
    usmo: boolean,
    umes: boolean,
    umces: boolean
}

/**
 * The UMD Directory allows the searching of University staff and students via
 * a variety of factors such as by name or email. This class interfaces with
 * the directory to allow you to perform searches.
 */
export class UMDDirectory {
    private axios: Axios


    constructor(axios: Axios) {
        this.axios = axios;
        this.axios.interceptors.response.use(this.directory_intercept.bind(this));
    }

    /**
     * Authenticates with the Directory system. This is required to include
     * student listings in the search results.
     */
    private async login() {
        await this.axios.post(UMD_DIRECTORY_URL, querystring.stringify({
            login: "Log in"
        }), X_WWW_FORM_HEADERS_CONFIG)
    }

    /**
     * A response interceptor for Axios. For any responses originating from the
     * directory system, if the page indicated that we were'nt logged in, this
     * will attempt to log in and retry the request.
     */
    private async directory_intercept(res: AxiosResponse<any, any>) {
        if (res.config.url?.startsWith(UMD_DIRECTORY_URL)) {
            if ((res.data as string).indexOf('value="Log in"') > 0) {
                console.log("Logging into UMD directory...")
                await this.login();
                return await retryRequest(res);
            }
        }
        
        return res;
    }

    /**
     * Scrapes the HTML of the page to extract name/email information from each
     * result.
     */
    private parseBody(data: string): DirectoryResult[] {
        const body = parse(data);
        const foundMembers = body.querySelectorAll(".DetailSection") ?? []
        return foundMembers.map(member => {
            const name = member.querySelector(".name")!.querySelector("strong")!.innerText
            const email = member.querySelector(".email")!.querySelector("a")!.innerText
            return {
                name: name,
                email: email
            }
        })
    }

    /**
     * Performs a search on the directory website using a specified form as 
     * search parameters.
     */
    private async searchWithForm(form: any): Promise<DirectoryResult[]> {
        // Create the form data used to search up the student
        const res = await this.axios.post(UMD_DIRECTORY_URL, querystring.stringify(form), X_WWW_FORM_HEADERS_CONFIG)

        // Parse the body, and for each found student, parse their name/email.
        return this.parseBody(res.data);
    }

    /**
     * Performs a basic search on the UMD directory website.
     * 
     * @param name The name to search
     * @returns A list of found results
     */
    public async search(name: string): Promise<DirectoryResult[]> {
        return await this.searchWithForm({
            basicSearchInput: name,
            basicSearch: "Search",
            "_lastNameSL": "on"
        })
    }

    /**
     * Performs an advanced search on the UMD directory website. This allows you
     * to search for more specific parameters like email and for students 
     * specifically.
     * 
     * @param config The advanced search config to use
     * @returns A list of found results
     */
    public async advancedSearch(config: Partial<AdvancedSearchParameters>): Promise<DirectoryResult[]> {
        return await this.searchWithForm({
            advancedSearch: true,
            "advancedSearchInputs.firstName": config.firstName,
            "advancedSearchInputs.middleName": config.middleName,
            "advancedSearchInputs.lastName": config.lastName,
            "advancedSearchInputs.email": config.email,
            "advancedSearchInputs.workPhone": config.workPhone,
            "advancedSearchInputs.department": config.department,
            "advancedSearchInputs.affiliation['umFaculty']": config.faculty,
            "advancedSearchInputs.affiliation['umStaff']": config.staff,
            "advancedSearchInputs.affiliation['umAffiliate']": config.affiliate,
            "advancedSearchInputs.affiliation['umStudent']": config.student,
            "advancedSearchInputs.institution['UMCP']": config.umd,
            "advancedSearchInputs.institution['USMO']": config.usmo,
            "advancedSearchInputs.institution['UMES']": config.umes,
            "advancedSearchInputs.institution['UMCES']": config.umces,
        })
    }
}