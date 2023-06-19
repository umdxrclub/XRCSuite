import { EmbedBuilder } from "discord.js";
import payload from "payload";

function makeCardEmbed(card: TrelloAPI.Card): EmbedBuilder {
  let embed = new EmbedBuilder();

  embed.setTitle(card.getName());
  embed.setDescription(card.getDescription());

  let dueDate = card.getDueDate();
  if (dueDate)
    embed.setTimestamp(dueDate);

  return embed;
}

export namespace TrelloAPI {
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

  export async function getBoards(): Promise<Board[]> {
    let trello = await payload.findGlobal({ slug: "trello" });
    let boardData = (await makeTrelloRequest(
      `/organizations/${trello.organization}/boards`
    )) as BoardData[];

    let boards = boardData.map((bd) => new Board(bd));
    return boards;
  }

  interface BoardData extends Identifiable {
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

  export class Board {
    private _data: BoardData;

    constructor(data: BoardData) {
      this._data = data;
    }

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

  interface LabelData extends Identifiable {
    idBoard: string,
    name: string,
    color: string,
    uses: number
  }

  interface CardData extends Identifiable {
    closed: boolean;
    dueComplete: boolean;
    dateLastActivity: string;
    desc: string;
    due: string | null;
    dueReminder: number;
    idBoard: string;
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

  export class Card {
    private _data: CardData;

    constructor(data: CardData) {
      this._data = data;
    }

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

    public async addComment(text: string) {
      await makeTrelloRequest(
        `/cards/${this._data.id}/actions/comments`,
        { text },
        "post"
      );
    }
  }

  interface Identifiable {
    id: string;
  }
}
