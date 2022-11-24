import { Button, Gutter } from "payload/components/elements";
import { List } from "payload/components/views/List";
import React from "react";

const ActionList: React.FC<any> = (props) => {

    return (
        <div>
            <List {...props} />
            <Gutter>
                <Button>Import from Roster</Button>
            </Gutter>
        </div>
    )
}

export default ActionList;