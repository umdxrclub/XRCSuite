import { Button } from "payload/components/elements";
import React, { useState } from "react";
import { Fragment } from "react"
import { BlockPicker } from "react-color";

const DefaultColor = "#a52256";

const LabColorPicker: React.FC = () => {
    const [ color, setColor ] = useState<string>();
    return (
        <Fragment>
            <BlockPicker color={color} onChange={c => setColor(c.hex)} />
            <Button>Set Color</Button>
        </Fragment>
    )
}

export default LabColorPicker;