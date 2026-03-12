import React from 'react';
import format from '../../common/hammer/format';
import {VisibleValues} from '../../components/VisibleValues/VisibleValues';

export type AclColumnsCellProps = {
    items?: Array<string>;
    expanadable?: boolean;
    withQoutes?: boolean;
};

function formatValue(value: string, {withQoutes}: {withQoutes?: boolean}) {
    return withQoutes ? `"${value}"` : value;
}

export function AclColumnsCell({expanadable, items, withQoutes}: AclColumnsCellProps) {
    if (!items) {
        return format.NO_VALUE;
    }

    return expanadable ? (
        <VisibleValues
            width="max"
            counter="missing-values"
            value={
                items?.map((v) => {
                    return formatValue(v, {withQoutes});
                }) ?? []
            }
            maxVisibleValues={5}
            maxTextLength={40}
        />
    ) : (
        items?.map((item) => `"${item}"`).join(', ')
    );
}
