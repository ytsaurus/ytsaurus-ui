import {isMediaTag} from '../../../../../utils/yql-types';

const getDefaultFormat = () => {
    return '--format json';
};

const getImageResultFormat = (columnName: string, tag: string) => {
    const [_, extension] = tag.split('/');
    return `--format "<columns=[${columnName}];enable_escaping=%false>schemaful_dsv" >${columnName}.${extension}`;
};

export const getCliCommandResultFormat = ({
    tag,
    columnName,
}: {
    tag?: string;
    columnName: string;
}) => {
    if (tag && isMediaTag(tag)) {
        return getImageResultFormat(columnName, tag as string);
    }

    return getDefaultFormat();
};
