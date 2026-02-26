import React from 'react';
import format from '../../common/hammer/format';
import {VisibleValues} from '../../components/VisibleValues/VisibleValues';

export type AclColumnsCellProps = {
    items?: Array<string>;
    expanadable?: boolean;
};

export function AclColumnsCell({expanadable, items}: AclColumnsCellProps) {
    if (!items) {
        return format.NO_VALUE;
    }

    return expanadable ? (
        <VisibleValues
            width="max"
            counter="missing-values"
            value={
                items?.map((v) => {
                    return `"${v}"`;
                }) ?? []
            }
            maxVisibleValues={5}
            maxTextLength={40}
        />
    ) : (
        items?.map((item) => `"${item}"`).join(', ')
    );
}
