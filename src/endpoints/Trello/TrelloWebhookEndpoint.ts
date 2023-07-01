import crypto from "crypto";
import { ButtonStyle } from "discord.js";
import { NextFunction, Response } from "express";
import payload from "payload";
import { Endpoint } from "payload/config";
import { PayloadRequest } from "payload/types";
import { getDiscordClient } from "../../discord/bot";
import { createButtonRowComponents } from "../../discord/util";
import { makeCardEmbed } from "../../globals/util/TrelloUtil";
import { Trello } from "../../server/trello";

/**
 * Verifies that the webhook request was sent from Trello.
 */
async function verifyTrelloWebhookRequest(
  req: PayloadRequest,
  res: Response,
  next: NextFunction
) {
  let secret = (await req.payload.findGlobal({ slug: "trello" })).secret;
  let valid: boolean = false;
  if (secret) {
    let body = req.body as Trello.WebhookResponse<any>;
    let callbackURL = body.webhook?.callbackURL;

    var base64Digest = function (s: string, secret: string) {
      return crypto.createHmac("sha1", secret).update(s).digest("base64");
    };
    var content = JSON.stringify(req.body) + callbackURL;
    var doubleHash = base64Digest(content, secret);
    var headerHash = req.headers["x-trello-webhook"];
    valid = doubleHash == headerHash;
  }

  if (valid) {
    next();
  } else {
    res.status(401).send();
  }
}

export const TrelloWebhookHEADEndpoint: Endpoint = {
  path: "/webhook",
  method: "head",
  handler: async (req, res) => {
    res.status(200).send();
  },
};

export const TrelloWebhookPOSTEndpoint: Endpoint = {
  path: "/webhook",
  method: "post",
  handler: [
    verifyTrelloWebhookRequest,
    async (req, res) => {
      let body = req.body as Trello.WebhookResponse<Trello.BoardData>;
      let action = body.action;

      res.status(200).send();

      if (action.type == "addMemberToCard") {
        console.log(
          `${action.memberCreator.fullName} added ${action.data.member!.name} to card ${action.data.card.name}`
        );
        sendCardPrompt(action.data.card.id, action.data.member!.id);
      } else if (action.type == "removeMemberFromCard") {
        console.log(
          `${action.memberCreator.fullName} removed ${action.data.member!.name} from card ${action.data.card.name}`
        );
      }
    },
  ],
};

async function sendCardPrompt(cardId: string, memberId: string) {
  let client = getDiscordClient();
  if (!client) return;

  let result = await payload.find({
    collection: "members",
    where: {
      and: [
        {
          "integrations.trello": {
            equals: memberId,
          },
        },
        {
          "integrations.discord": {
            not_equals: "",
          },
        },
      ],
    },
  });

  if (result.totalDocs != 1) return;

  let member = result.docs[0];
  let discordId = member.integrations.discord;

  // Need to make sure that the discord id actually exists.
  if (!discordId) return;

  let card = await Trello.getCard(cardId);
  let embed = await makeCardEmbed(card);
  let buttons = createButtonRowComponents([
    {
      style: ButtonStyle.Link,
      label: "View on Trello",
      url: card.getUrl(),
    },
    {
      style: ButtonStyle.Danger,
      label: "Decline",
      customId: `Trello-Decline-${cardId}`,
    },
    {
      style: ButtonStyle.Success,
      label: "Accept",
      customId: `Trello-Accept-${cardId}`,
    },
  ]);

  client.users.send(discordId, {
    embeds: [embed],
    content:
      '# You have been assigned a task!\nPlease take a look at its details below. If you accept the criteria and deadline, please click the "Accept" button blow. If you believe you are unable to complete the task (you are too busy, unclear criteria, need assistance, etc.), please click the "Decline" button and fill in the appropriate reason.',
    components: buttons,
  });
}
