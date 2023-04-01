import { Button } from "payload/components/elements";
import { useDocumentInfo } from "payload/components/utilities";
import React from "react";

type LinkButtonProps = {
    name: string,
    url: string
}

export const LinkButton: React.FC<LinkButtonProps> = ({name, url}) => {
    const document = useDocumentInfo();
    if (document) {
        url = url.replace(":id", document.id?.toString())
    }
   
    return <div style={{padding: 16, marginTop: 6, marginBottom: 6}}>
        <Button key={"LB-" + name} el={url.startsWith("/") ? "link" : "anchor"} url={url} newTab={true}>
        {name}
    </Button></div>
}

export function createLinkButton(name: string, url: string): React.FC {
    return  ({}) => {
        return <LinkButton name={name} url={url} />
    }
}