import { Button } from "payload/components/elements";
import React from "react";
import { toast } from "react-toastify";
import { useDocumentInfo } from "payload/components/utilities";

type ActionButtonProps = {
    title: string,
    postUrl: string
}

const ActionButton: React.FC<ActionButtonProps> = ({title, postUrl}) => {
    const document = useDocumentInfo();

    async function post() {
        let response = await fetch(postUrl.replace(":id", document.id?.toString()), {
            method: 'POST'
        })

        var json: any | undefined
        try {
            json = await response.json()
        } catch {
            json = undefined
        }

        if (response.status == 200) {
            toast.success(json?.message ?? "This action completed successfully!")
        } else {
            toast.error(json?.error ?? "There was an error completing this request.")
        }
    }

    return <Button onClick={post}>
        {title}
    </Button>
}

export default ActionButton;

export function createActionButton(props: ActionButtonProps): React.FC {
    return ({}) => {
        return <ActionButton {...props} />
    }
}