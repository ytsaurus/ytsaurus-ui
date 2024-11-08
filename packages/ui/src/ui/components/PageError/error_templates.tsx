import React from 'react';
import {WordWrapPath} from '../WordWraps';

export interface TitlePathNotFoundProps {
    path: string;
}

export const TitlePathNotFound: React.FC<TitlePathNotFoundProps> = ({path}): React.ReactNode => {
    return (
        <>
            Path “<WordWrapPath path={path} />” does not exist
        </>
    );
};

export interface TitlePermissionsDeniedProps {
    path: string;
    types: string | [string, ...string[]];
    user: string;
}

export const TitlePermissionsDenied: React.FC<TitlePermissionsDeniedProps> = ({
    path,
    types,
    user,
}) => {
    const typesList = (Array.isArray(types) ? types : [types]).map((type) => `“${type}”`);
    const lastType = typesList.pop();
    let typesValue = typesList.join(', ');

    if (lastType && typesList.length > 0) {
        typesValue += ' and ';
    }

    typesValue += lastType;

    return (
        <>
            User “{user}” does not have {typesValue} access to node “<WordWrapPath path={path} />”
        </>
    );
};
