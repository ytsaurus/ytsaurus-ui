import React, {FC, useMemo} from 'react';
import {UnipikaSettings} from '../Yson/StructuredYson/StructuredYsonTypes';
import {DownloadFileButton} from './DownloadFileButton';
import {attributesToString} from './helpers/attributesToString';

type Props = {
    name?: string;
    value?: unknown;
    settings: UnipikaSettings;
};

export const YsonDownloadButton: FC<Props> = ({value, name, settings}) => {
    const fileName = name || 'data';

    const fileContent: string = useMemo(() => {
        return attributesToString(value, settings);
    }, [settings, value]);

    return (
        <DownloadFileButton content={fileContent} name={`${fileName}.txt`} type="application/txt" />
    );
};
