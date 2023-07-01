import payload from "payload";

export namespace Trello {
  async function makeTrelloRequest(
    path: string,
    query?: Record<string, string>,
    method?: string
  ) {
    let trello = await payload.findGlobal({ slug: "trello" });

    // Make sure we have a key AND token.
    if (!trello.key || !trello.token) return;

    let params = new URLSearchParams({
      key: trello.key,
      token: trello.token,
      ...query,
    });

    let url = `https://api.trello.com/1${path}?${params.toString()}`;
    let response = await fetch(url, {
      method: method ?? "get",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      let text = await response.text();
      throw new Error("Non 200 Trello Request: " + text);
    }

    let json = await response.json();
    return json;
  }

  export async function createWebhook(idModel: string): Promise<Webhook> {
    let callbackURL = "https://devtemp.umdxr.club/api/globals/trello/webhook";
    let data = (await makeTrelloRequest(
      "/webhooks",
      { idModel, callbackURL },
      "post"
    )) as WebhookData;
    let webhook = new Webhook(data);

    return webhook;
  }

  export async function getBoards(): Promise<Board[]> {
    let trello = await payload.findGlobal({ slug: "trello" });
    let boardData = (await makeTrelloRequest(
      `/organizations/${trello.organization}/boards`
    )) as BoardData[];

    let boards = boardData.map((bd) => new Board(bd));
    return boards;
  }

  export async function getCard(id: string): Promise<Card> {
    return await getAndConstruct(Card, "cards", id);
  }

  export async function getBoard(id: string): Promise<Board> {
    return await getAndConstruct(Board, "boards", id);
  }

  export async function getChecklist(id: string): Promise<Checklist> {
    return await getAndConstruct(Checklist, "checklists", id);
  }

  async function getAndConstruct<
    TData extends IdentifiableData,
    T extends Identifiable<TData>
  >(type: { new (data: TData): T }, name: string, id: string) {
    let path = `/${name}/${id}`;
    let data = (await makeTrelloRequest(path)) as TData;
    let obj = new type(data);

    return obj;
  }

  interface IdentifiableData {
    id: string;
  }

  abstract class Identifiable<T extends IdentifiableData> {
    protected _data: T;

    constructor(data: T) {
      this._data = data;
    }

    public getId(): string {
      return this._data.id;
    }

    public async delete() {
      throw new Error("Not implemented");
    }
  }

  export interface BoardData extends IdentifiableData {
    name: string;
    desc: string;
    descData: string;
    closed: boolean;
    idMemberCreator: string;
    idOrganization: string;
    pinned: boolean;
    url: string;
    shortUrl: string;
    starred: boolean;
    memberships: string;
    shortLink: string;
    subscribed: boolean;
    powerUps: string;
    dateLastActivity: string;
    dateLastView: string;
    idTags: string;
    datePluginDisable: string;
    creationMethod: string;
    ixUpdate: number;
    templateGallery: string;
    enterpriseOwned: boolean;
  }

  export class Board extends Identifiable<BoardData> {
    public getName(): string {
      return this._data.name;
    }

    public async getCards(): Promise<Card[]> {
      let cardData = (await makeTrelloRequest(
        `/boards/${this._data.id}/cards`
      )) as CardData[];
      let cards = await cardData.map((cd) => new Card(cd));

      return cards;
    }
  }

  export interface LabelData extends IdentifiableData {
    idBoard: string;
    name: string;
    color: string;
    uses: number;
  }

  export interface ChecklistData extends IdentifiableData {
    name: string;
    idBoard: string;
    idCard: string;
    pos: number;
    checkItems: {
      id: string;
      name: string;
      pos: number;
      state: string;
      due: string | null;
      dueReminder: string | null;
      idMember: string | null;
      idChecklist: string;
    }[];
  }

  type ChecklistItem = {
    name: string;
    state: string;
    due: Date | null;
    dueReminder: Date | null;
  };

  export class Checklist extends Identifiable<ChecklistData> {
    getName(): string {
      return this._data.name;
    }

    getItems(): ChecklistItem[] {
      return this._data.checkItems.map((c) => ({
        name: c.name,
        state: c.state,
        due: c.due ? new Date(c.due) : null,
        dueReminder: c.dueReminder ? new Date(c.dueReminder) : null,
      }));
    }
  }

  export interface CardData extends IdentifiableData {
    closed: boolean;
    dueComplete: boolean;
    dateLastActivity: string;
    desc: string;
    due: string | null;
    dueReminder: number;
    idBoard: string;
    idChecklists: string[];
    idMembers: string[];
    idList: string;
    labels: LabelData[];
    manualCoverAttachment: boolean;
    name: string;
    pos: number;
    shortLink: string;
    shortUrl: string;
    subscribed: boolean;
    url: string;
    isTemplate: boolean;
  }

  export class Card extends Identifiable<CardData> {
    public getName(): string {
      return this._data.name;
    }

    public getDueDate(): Date | null {
      return this._data.due ? new Date(this._data.due) : null;
    }

    public getDescription(): string {
      return this._data.desc;
    }

    public getLabels(): LabelData[] {
      return this._data.labels;
    }

    public getMemberIds(): string[] {
      return this._data.idMembers;
    }

    public getUrl(): string {
      return this._data.url;
    }

    public async getChecklists(): Promise<Checklist[]> {
      let promises = this._data.idChecklists.map((id) => getChecklist(id));
      let checklists = await Promise.all(promises);

      return checklists;
    }

    public async addComment(text: string) {
      await makeTrelloRequest(
        `/cards/${this._data.id}/actions/comments`,
        { text },
        "post"
      );
    }
  }

  export interface ActionData extends IdentifiableData {
    id: string;
    idMemberCreator: string;
    data: {
      text: string;
      card: {
        id: string;
        name: string;
        idShort: number;
        shortLink: string;
      };
      board: {
        id: string;
        name: string;
        shortLink: string;
      };
      list: {
        id: string;
        name: string;
      };
      member?: {
        id: string;
        name: string;
      };
    };
    limits: {
      reactions: {
        perAction: {
          status: string;
          disableAt: number;
          warnAt: number;
        };
        uniquePerAction: {
          status: string;
          disableAt: number;
          warnAt: number;
        };
      };
    };
    display: {
      translationKey: string;
      entities: {
        contextOn: {
          type: string;
          translationKey: string;
          hideIfContext: boolean;
          idContext: string;
        };
        card: {
          type: string;
          id: string;
          hideIfContext: boolean;
          shortLink: string;
          text: string;
        };
        comment: {
          type: string;
          text: string;
        };
        memberCreator: {
          type: string;
          id: string;
          username: string;
          text: string;
        };
      };
    };
    memberCreator: {
      id: string;
      activityBlocked: boolean;
      avatarHash: string;
      avatarUrl: string;
      fullName: string;
      idMemberReferrer: string;
      initials: string;
      username: string;
    };
    type: ActionType;
    date: string;
  }

  interface MemberData extends IdentifiableData {
    id: string;
    activityBlocked: boolean;
    avatarHash: string;
    avatarUrl: string;
    bio: string;
    confirmed: boolean;
    fullName: string;
    idEnterprise: string;
    idEnterprisesDeactivated: string;
    idMemberReferrer: string;
    initials: string;
    username: string;
  }

  class Member extends Identifiable<MemberData> {
    getName(): string {
        return this._data.fullName;
    }
  }

  export interface WebhookData extends IdentifiableData {
    description: string;
    idModel: string;
    callbackURL: string;
    active: boolean;
    consecutiveFailures: number;
    firstConsecutiveFailDate: string | null;
  }

  export type IncludedActionType =
    | "acceptEnterpriseJoinRequest"
    | "addAttachmentToCard"
    | "addChecklistToCard"
    | "addMemberToBoard"
    | "addMemberToCard"
    | "addMemberToOrganization"
    | "addOrganizationToEnterprise"
    | "addToEnterprisePluginWhitelist"
    | "addToOrganizationBoard"
    | "commentCard"
    | "convertToCardFromCheckItem"
    | "copyBoard"
    | "copyCard"
    | "copyCommentCard"
    | "createBoard"
    | "createCard"
    | "createList"
    | "createOrganization"
    | "deleteBoardInvitation"
    | "deleteCard"
    | "deleteOrganizationInvitation"
    | "disableEnterprisePluginWhitelist"
    | "disablePlugin"
    | "disablePowerUp"
    | "emailCard"
    | "enableEnterprisePluginWhitelist"
    | "enablePlugin"
    | "enablePowerUp"
    | "makeAdminOfBoard"
    | "makeNormalMemberOfBoard"
    | "makeNormalMemberOfOrganization"
    | "makeObserverOfBoard"
    | "memberJoinedTrello"
    | "moveCardFromBoard"
    | "moveCardToBoard"
    | "moveListFromBoard"
    | "moveListToBoard"
    | "removeChecklistFromCard"
    | "removeFromEnterprisePluginWhitelist"
    | "removeFromOrganizationBoard"
    | "removeMemberFromCard"
    | "removeOrganizationFromEnterprise"
    | "unconfirmedBoardInvitation"
    | "unconfirmedOrganizationInvitation"
    | "updateBoard"
    | "updateCard"
    | "updateCheckItemStateOnCard"
    | "updateChecklist"
    | "updateList"
    | "updateMember"
    | "updateOrganization";

  export type ExcludedActionType =
    | "addLabelToCard"
    | "copyChecklist"
    | "createBoardInvitation"
    | "createBoardPreference"
    | "createCheckItem"
    | "createLabel"
    | "createOrganizationInvitation"
    | "deleteAttachmentFromCard"
    | "deleteCheckItem"
    | "deleteComment"
    | "deleteLabel"
    | "makeAdminOfOrganization"
    | "removeLabelFromCard"
    | "removeMemberFromBoard"
    | "removeMemberFromOrganization"
    | "updateCheckItem"
    | "updateComment"
    | "updateLabel"
    | "voteOnCard";

  export type ActionType = IncludedActionType | ExcludedActionType;

  export interface WebhookResponse<TModel extends IdentifiableData> {
    action: ActionData;
    model: TModel;
    webhook: WebhookData;
  }

  class Webhook extends Identifiable<WebhookData> {}
}
