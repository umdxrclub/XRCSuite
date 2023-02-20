/* tslint:disable */
/**
 * This file was automatically generated by Payload CMS.
 * DO NOT MODIFY IT BY HAND. Instead, modify your source Payload config,
 * and re-run `payload generate:types` to regenerate this file.
 */

export interface Config {
  collections: {
    admins: Admin;
    members: Member;
    devices: Device;
    heartbeats: Heartbeat;
    attendances: Attendance;
    events: Event;
    descriptions: Description;
    messages: Message;
    software: Software;
    projects: Project;
    media: Media;
    schedules: Schedule;
    polls: Poll;
    stats: Stat;
    roles: Role;
    integrations: Integration;
  };
  globals: {
    lab: Lab;
    bot: Bot;
    cas: CAS;
    wishlist: Wishlist;
    odoo: Odoo;
  };
}
export interface Admin {
  id: string;
  casManager?: boolean;
  enableAPIKey?: boolean;
  apiKey?: string;
  apiKeyIndex?: string;
  email?: string;
  resetPasswordToken?: string;
  resetPasswordExpiration?: string;
  loginAttempts?: number;
  lockUntil?: string;
  createdAt: string;
  updatedAt: string;
  password?: string;
}
export interface Member {
  id: string;
  name?: string;
  nickname?: string;
  birthday?: string;
  email?: string;
  isClubMember?: boolean;
  roles?: string[] | Role[];
  profile: {
    picture?: string | Media;
    links: {
      type: string | Integration;
      url: string;
      id?: string;
    }[];
    bio?: string;
  };
  umd: {
    directoryId?: string;
    cardSerial?: string;
    terplink: {
      accountId?: string;
      issuanceId?: string;
      communityId?: string;
    };
  };
  integrations: {
    discord?: string;
    oculus?: string;
    steam?: string;
    scoresaber?: string;
  };
  createdAt: string;
  updatedAt: string;
}
export interface Role {
  id: string;
  name: string;
  color?: string;
  priority: number;
  discordRoleId?: string;
  discordEmoji?: string;
  isLeadership: boolean;
  isSelfAssignable: boolean;
}
export interface Media {
  id: string;
  isPublic?: boolean;
  url?: string;
  filename?: string;
  mimeType?: string;
  filesize?: number;
  width?: number;
  height?: number;
  createdAt: string;
  updatedAt: string;
}
export interface Integration {
  id: string;
  name?: string;
  discordEmoji?: string;
}
export interface Device {
  id: string;
  description: string | Description;
  status: 'inLab' | 'checkedOut';
  public: boolean;
  model?: string;
  originalValue?: number;
  serial?: string;
  mac?: string;
  sponsor?: string;
  purchaser?: string;
  owner?: string;
  umdSerial?: string;
  xrTag?: string;
  location?: string;
  dateReceived?: string;
  dateReturned?: string;
  lastAudited?: string;
  items: {
    name: string;
    quantity: number;
    modelNumber?: string;
    serialNumber?: string;
    xrTag?: string;
    notes?: string;
    id?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}
export interface Description {
  id: string;
  name: string;
  image?: string | Media;
  type:
    | 'h_vr'
    | 'h_ar'
    | 'h_xr'
    | 'h_vr_accessory'
    | 'h_pc'
    | 'h_laptop'
    | 'h_console'
    | 'h_phone'
    | 'h_misc'
    | 's_game'
    | 's_software';
  description?: {
    [k: string]: unknown;
  }[];
  createdAt: string;
  updatedAt: string;
}
export interface Heartbeat {
  id: string;
  device?: string | Device;
  date?: string;
  /**
   * @minItems 2
   * @maxItems 2
   */
  location?: [number, number];
  battery: {
    level?: number;
    charging?: boolean;
  };
  network: {
    ipAddress?: string;
    wifi: {
      current: {
        ssid?: string;
        bssid?: string;
        level?: number;
      };
      nearbyNetworks: {
        ssid?: string;
        bssid?: string;
        level?: number;
        id?: string;
      }[];
    };
  };
  createdAt: string;
  updatedAt: string;
}
export interface Attendance {
  id: string;
  member?: string | Member;
  date?: string;
  event?: string | Event;
  type?: 'in' | 'out';
  createdAt: string;
  updatedAt: string;
}
export interface Event {
  id: string;
  name?: string;
  type?: 'Workshop' | 'Interest Meeting' | 'Speaker Event' | 'Game Night' | 'Tournament' | 'Field Trip' | 'Other';
  location?: string;
  startDate?: string;
  endDate?: string;
  imageUrl?: string;
  description?: string;
  terplink: {
    eventId?: string;
    accessCode?: string;
  };
  discord: {
    eventId?: string;
    messageId?: string;
  };
  createdAt: string;
  updatedAt: string;
}
export interface Message {
  id: string;
  name: string;
  useMessageContent: boolean;
  content: (
    | {
        body: {
          [k: string]: unknown;
        }[];
        id?: string;
        blockName?: string;
        blockType: 'message';
      }
    | {
        title: string;
        type: 'medium' | 'large';
        id?: string;
        blockName?: string;
        blockType: 'banner';
      }
    | {
        id?: string;
        blockName?: string;
        blockType: 'roleSelect';
      }
    | {
        member?: string | Member;
        id?: string;
        blockName?: string;
        blockType: 'profile';
      }
    | {
        device: string | Device;
        id?: string;
        blockName?: string;
        blockType: 'device';
      }
    | {
        poll: string | Poll;
        allowVoting: boolean;
        id?: string;
        blockName?: string;
        blockType: 'poll';
      }
    | {
        event: string | Event;
        id?: string;
        blockName?: string;
        blockType: 'event';
      }
    | {
        buttons: {
          title: string;
          url: string;
          emoji?: string;
          id?: string;
        }[];
        id?: string;
        blockName?: string;
        blockType: 'linkButtons';
      }
    | {
        image: string | Media;
        id?: string;
        blockName?: string;
        blockType: 'image';
      }
    | {
        title?: string;
        description?: {
          [k: string]: unknown;
        }[];
        color?: string;
        timestamp?: string;
        url?: string;
        fields: {
          name: string;
          value: string;
          inline: boolean;
          id?: string;
        }[];
        id?: string;
        blockName?: string;
        blockType: 'embed';
      }
  )[];
  channels: {
    channelId: string;
    alwaysResendMessages: boolean;
    messages: {
      messageId: string;
      id?: string;
    }[];
    id?: string;
  }[];
  publish?: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface Poll {
  id: string;
  title?: string;
  open?: boolean;
  allowRevote?: boolean;
  author?: string;
  messages: {
    channel?: string;
    msg?: string;
    id?: string;
  }[];
  choices: {
    name?: string;
    voters: {
      id?: string;
    }[];
    id?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}
export interface Software {
  id: string;
  type?: string | Description;
  availableOn?: string[] | Device[];
  publish?: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface Project {
  id: string;
  name?: string;
  status?: 'Proposed' | 'Active' | 'Inactive' | 'Finished';
  projectLeads?: string[] | Member[];
  members?: string[] | Member[];
  logo?: string | Media;
  banner?: string | Media;
  gallery: {
    image?: string | Media;
    description?: string;
    id?: string;
  }[];
  startDate?: string;
  endDate?: string;
  description?: {
    [k: string]: unknown;
  }[];
  createdAt: string;
  updatedAt: string;
}
export interface Schedule {
  id: string;
  name: string;
  schedule: {
    sunday: (
      | {
          time: {
            allDay: boolean;
            from?: string;
            to?: string;
          };
          staff?: string[] | Member[];
          note?: string;
          id?: string;
          blockName?: string;
          blockType: 'opening';
        }
      | {
          time: {
            allDay: boolean;
            from?: string;
            to?: string;
          };
          note?: string;
          id?: string;
          blockName?: string;
          blockType: 'closing';
        }
    )[];
    monday: (
      | {
          time: {
            allDay: boolean;
            from?: string;
            to?: string;
          };
          staff?: string[] | Member[];
          note?: string;
          id?: string;
          blockName?: string;
          blockType: 'opening';
        }
      | {
          time: {
            allDay: boolean;
            from?: string;
            to?: string;
          };
          note?: string;
          id?: string;
          blockName?: string;
          blockType: 'closing';
        }
    )[];
    tuesday: (
      | {
          time: {
            allDay: boolean;
            from?: string;
            to?: string;
          };
          staff?: string[] | Member[];
          note?: string;
          id?: string;
          blockName?: string;
          blockType: 'opening';
        }
      | {
          time: {
            allDay: boolean;
            from?: string;
            to?: string;
          };
          note?: string;
          id?: string;
          blockName?: string;
          blockType: 'closing';
        }
    )[];
    wednesday: (
      | {
          time: {
            allDay: boolean;
            from?: string;
            to?: string;
          };
          staff?: string[] | Member[];
          note?: string;
          id?: string;
          blockName?: string;
          blockType: 'opening';
        }
      | {
          time: {
            allDay: boolean;
            from?: string;
            to?: string;
          };
          note?: string;
          id?: string;
          blockName?: string;
          blockType: 'closing';
        }
    )[];
    thursday: (
      | {
          time: {
            allDay: boolean;
            from?: string;
            to?: string;
          };
          staff?: string[] | Member[];
          note?: string;
          id?: string;
          blockName?: string;
          blockType: 'opening';
        }
      | {
          time: {
            allDay: boolean;
            from?: string;
            to?: string;
          };
          note?: string;
          id?: string;
          blockName?: string;
          blockType: 'closing';
        }
    )[];
    friday: (
      | {
          time: {
            allDay: boolean;
            from?: string;
            to?: string;
          };
          staff?: string[] | Member[];
          note?: string;
          id?: string;
          blockName?: string;
          blockType: 'opening';
        }
      | {
          time: {
            allDay: boolean;
            from?: string;
            to?: string;
          };
          note?: string;
          id?: string;
          blockName?: string;
          blockType: 'closing';
        }
    )[];
    saturday: (
      | {
          time: {
            allDay: boolean;
            from?: string;
            to?: string;
          };
          staff?: string[] | Member[];
          note?: string;
          id?: string;
          blockName?: string;
          blockType: 'opening';
        }
      | {
          time: {
            allDay: boolean;
            from?: string;
            to?: string;
          };
          note?: string;
          id?: string;
          blockName?: string;
          blockType: 'closing';
        }
    )[];
  };
  createdAt: string;
  updatedAt: string;
}
export interface Stat {
  id: string;
  date?: string;
  count: {
    discord?: number;
    terplink?: number;
    youtube?: number;
    instagram?: number;
    twitter?: number;
  };
  createdAt: string;
  updatedAt: string;
}
export interface Lab {
  id: string;
  open: boolean;
  event?: string | Event;
  members?: string[] | Member[];
  schedule?: string | Schedule;
  odoo: {
    contractId?: number;
  };
  media: {
    gatekeeper: {
      acceptSound?: string | Media;
      rejectSound?: string | Media;
    };
    labOpenImage?: string | Media;
    labClosedImage?: string | Media;
    tvBanner?: string | Media;
  };
  discord: {
    labMessage?: string | Message;
    labControlMessage?: string | Message;
    inventoryMessage?: string | Message;
    labNotificationsRole?: string | Role;
  };
  settings: {
    startupLabWhenFirstCheckIn?: boolean;
    shutdownLabWhenAllCheckedOut?: boolean;
    notifyStatus?: boolean;
    notifyLeadershipCheckInOut?: boolean;
    rolesToAnnounce?: string[] | Role[];
  };
}
export interface Bot {
  id: string;
  enabled?: boolean;
  auth: {
    clientId?: string;
    clientSecret?: string;
    token?: string;
  };
  media: {
    banner?: string | Media;
  };
  guild: {
    guildId?: string;
    channels: {
      announcements?: string;
      lab?: string;
      notifications?: string;
      inventory?: string;
      audit?: string;
      events?: string;
      leadership?: string;
    };
    defaultRole?: string | Role;
    notificationRoles: {
      lab?: string | Role;
      workshop?: string | Role;
      project?: string | Role;
    };
  };
}
export interface CAS {
  id: string;
  username?: string;
  password?: string;
  duoDeviceName?: string;
  hotpSecret?: string;
  hotpCounter?: number;
}
export interface Wishlist {
  id: string;
  wishlist: {
    type?: string | Description;
    quantity?: number;
    id?: string;
  }[];
}
export interface Odoo {
  id: string;
  url?: string;
  db?: string;
  uid?: number;
  password?: string;
}
