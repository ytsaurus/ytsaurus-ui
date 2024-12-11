import React, {FC} from 'react';
import {Button} from '@gravity-ui/uikit';
import Icon from '../../components/Icon/Icon';

type Props = {
    content: string;
    name: string;
    type?: string;
};

export const DownloadFileButton: FC<Props> = ({name, type, content}) => {
    const handleClick = () => {
        const blob = new Blob([content], {type});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = name;
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <Button view="flat" onClick={handleClick}>
            <Icon awesome="download" size={16} /> Download
        </Button>
    );
};
