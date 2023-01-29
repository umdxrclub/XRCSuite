import { CollectionConfig } from "payload/types";
import DirectorySearchEndpoint from "../endpoints/Members/DirectorySearch";
import ImportRosterEndpoint from "../endpoints/Members/ImportTerpLinkRoster";
import LeadershipEndpoint from "../endpoints/Members/Leadership";
import ResolveMemberEndpoint from "../endpoints/Members/ResolveMember";
import UMDVerificationEndpoint from "../endpoints/Members/UMDVerification";
import { CollectionSlugs } from "../slugs";
import { LeadershipRoles, ProfileLinks } from "../types/XRCTypes";
import Media from "./Media";

const Members: CollectionConfig = {
    slug: CollectionSlugs.Members,
    admin: {
        useAsTitle: 'name',
        group: 'Users',
        defaultColumns: [ 'name', 'nickname', 'email', 'isClubMember' ]
    },
    endpoints: [ImportRosterEndpoint, ResolveMemberEndpoint, UMDVerificationEndpoint, LeadershipEndpoint, DirectorySearchEndpoint ],
    fields: [
        {
            name: 'name',
            type: 'text'
        },
        {
            name: 'nickname',
            type: 'text'
        },
        {
            name: 'birthday',
            type: 'date'
        },
        {
            name: 'email',
            type: 'text',
            unique: true,
            index: true
        },
        {
            name: 'isClubMember',
            type: 'checkbox'
        },
        {
            name: 'leadershipRoles',
            type: 'select',
            options: LeadershipRoles,
            hasMany: true,
            defaultValue: []
        },
        {
            name: 'profile',
            type: 'group',
            fields: [
                {
                    name: 'picture',
                    type: 'upload',
                    relationTo: Media.slug
                },
                {
                    name: 'links',
                    type: 'array',
                    fields: [
                        {
                            name: 'type',
                            type: 'select',
                            options: ProfileLinks,
                            required: true
                        },
                        {
                            name: 'url',
                            type: 'text',
                            required: true
                        }
                    ]
                },
                {
                    name: 'bio',
                    type: 'textarea'
                }
            ]
        },
        {
            name: 'umd',
            label: 'UMD',
            type: 'group',
            fields: [
                {
                    name: 'directoryId',
                    type: 'text',
                    unique: true
                },
                {
                    name: 'cardSerial',
                    type: 'text',
                    index: true,
                    unique: true,
                    admin: {
                        description: "The serial number on the back of a UMD swipe card"
                    }
                },
                {
                    name: 'terplink',
                    type: 'group',
                    fields: [
                        {
                            name: 'accountId',
                            type: 'text',
                            unique: true
                        },
                        {
                            name: 'issuanceId',
                            admin: {
                                description: "The id stored within an event pass"
                            },
                            type: 'text',
                            unique: true,
                            index: true
                        },
                        {
                            name: 'communityId',
                            admin: {
                                description: "Used to identify members within the club roster"
                            },
                            type: 'text',
                            unique: true,
                            index: true
                        }
                    ]
                }
            ]
        },
        {
            name: 'integrations',
            type: 'group',
            fields: [
                {
                    name: 'discord',
                    type: 'text',
                    unique: true,
                },
                {
                    name: 'oculus',
                    type: 'text'
                },
                {
                    name: 'steam',
                    type: 'text'
                },
                {
                    name: 'scoresaber',
                    type: 'text'
                }
            ]
        }
    ]
}

export default Members;