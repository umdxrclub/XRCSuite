import React from "react";
import { useFormFields } from 'payload/components/forms';

export const EventThumbnail: React.FC<{ path: string }> = ({children}) => {
    const imageUrl = useFormFields(([fields, dispatch]) => fields.imageUrl)

    return (
        imageUrl.valid ?
            <img
                src={imageUrl.value as string} 
            /> : null
    )
}