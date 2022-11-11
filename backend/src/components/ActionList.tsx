import { List } from "payload/components/views/List";
import React from "react";

const ActionList: React.FC<any> = (props) => {

    return (
        <div>
            <List {...props} />
        </div>
    )
}

export default ActionList;