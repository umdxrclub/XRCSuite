import { Button } from "payload/components/elements";
import { useDocumentInfo } from "payload/components/utilities";
import React from "react";
import "./ActionButton.css"
import { Box } from "@mui/system";

export type LinkButtonProps = {
  name: string;
  url: string;
};

export const LinkButton: React.FC<LinkButtonProps> = ({ name, url }) => {
  const document = useDocumentInfo();
  if (document?.id) url = url.replace(":id", document.id?.toString());

  return (
    <Box display={"flex"}>
      <Button
        key={"LB-" + name}
        el={url.startsWith("/") ? "link" : "anchor"}
        url={url}
        newTab={true}
        className="action-button"
      >
        {name}
      </Button>
    </Box>
  );
};

export function createLinkButton(name: string, url: string): React.FC {
  return ({}) => {
    return <LinkButton name={name} url={url} />;
  };
}
