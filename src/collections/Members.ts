import { CollectionConfig } from "payload/types";
import DirectorySearchEndpoint from "../endpoints/Members/DirectorySearch";
import DiscordAvatarEndpoint from "../endpoints/Members/DiscordAvatar";
import ImportRosterEndpoint from "../endpoints/Members/ImportTerpLinkRoster";
import LeadershipEndpoint from "../endpoints/Members/Leadership";
import ResolveMemberEndpoint from "../endpoints/Members/ResolveMember";
import UMDVerificationEndpoint from "../endpoints/Members/UMDVerification";
import { CollectionSlugs } from "../slugs";
import Media from "./Media";

const Members: CollectionConfig = {
    slug: CollectionSlugs.Members,
    admin: {
        useAsTitle: 'name',
        group: 'Users',
        defaultColumns: [ 'name', 'nickname', 'email', 'isClubMember' ]
    },
    endpoints: [ImportRosterEndpoint, ResolveMemberEndpoint, UMDVerificationEndpoint, LeadershipEndpoint, DirectorySearchEndpoint, DiscordAvatarEndpoint ],
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
            index: true
        },
        {
            name: 'isClubMember',
            type: 'checkbox'
        },
        {
            name: 'roles',
            type: 'relationship',
            relationTo: CollectionSlugs.Roles,
            hasMany: true
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
                            type: 'relationship',
                            relationTo: CollectionSlugs.Integrations,
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
                },
                {
                    name: 'cardSerial',
                    type: 'text',
                    index: true,
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
                        },
                        {
                            name: 'issuanceId',
                            admin: {
                                description: "The id stored within an event pass"
                            },
                            type: 'text',
                            index: true
                        },
                        {
                            name: 'communityId',
                            admin: {
                                description: "Used to identify members within the club roster"
                            },
                            type: 'text',
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