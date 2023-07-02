import { Stack } from "@mui/system";
import React from "react";
import { LinkButtonProps, createLinkButton } from "./LinkButton";
import {
  PostActionButtonProps,
  createPostActionButton,
} from "./PostActionButton";

type PostActionButton = PostActionButtonProps & {
  type: "action";
};

type LinkButton = LinkButtonProps & {
  type: "link";
};

export type ActionButton = PostActionButton | LinkButton;

export function createActionButtons(buttons: ActionButton[]) {
  return ({}) => {
    return (
      <Stack direction={"row"} spacing={1} marginBottom={4}>
        {buttons.map((b) => {
          var NewButton;
          if (b.type === "action") {
            NewButton = createPostActionButton(b);
          } else {
            NewButton = createLinkButton(b.name, b.url);
          }

          return <NewButton />;
        })}
      </Stack>
    );
  };
}
