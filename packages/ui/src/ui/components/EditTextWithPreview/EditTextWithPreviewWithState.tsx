import React, {FC, useState} from 'react';
import {EditTextWithPreview, EditTextWithPreviewProps} from './EditTextWithPreview';

export const EditTextWithPreviewWithState: FC<EditTextWithPreviewProps> = ({
    onChange,
    value,
    ...props
}) => {
    const [editorValue, setEditorValue] = useState(value);

    const handleChange = (newValue: {value: string | undefined}) => {
        setEditorValue(newValue);
        onChange(newValue);
    };

    return <EditTextWithPreview {...props} value={editorValue} onChange={handleChange} />;
};
