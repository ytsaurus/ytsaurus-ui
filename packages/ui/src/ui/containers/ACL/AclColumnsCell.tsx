import React from 'react';
import format from '../../common/hammer/format';
import {VisibleValues} from '../../components/VisibleValues/VisibleValues';
import {renderText} from '../../components/templates/utils';
import unipika from '../../common/thor/unipika';

export type AclColumnsCellProps = {
    items?: Array<string>;
    expanadable?: boolean;
    skipDecode?: boolean;
};

export function AclColumnsCell({expanadable, items, skipDecode}: AclColumnsCellProps) {
    if (!items) {
        return format.NO_VALUE;
    }

    if (expanadable)
        return (
            <VisibleValues
                width="max"
                counter="missing-values"
                value={
                    items?.map((v) => {
                        return skipDecode ? `"${v}"` : `"${unipika.decode(v)}"`;
                    }) ?? []
                }
                maxVisibleValues={5}
                maxTextLength={40}
            />
        );

    return skipDecode
        ? items?.map((item) => `"${item}"`).join(', ')
        : renderText(items?.map((item) => `"${item}"`).join(', '));
}
