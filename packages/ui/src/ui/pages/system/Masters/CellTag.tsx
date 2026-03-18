import React from 'react';

import format from '../../../common/hammer/format';

import Icon from '../../../components/Icon/Icon';
import {ClipboardButton, MetaTable, Secondary, Tooltip} from '@ytsaurus/components';

export function CellTag({cellTag, className}: {cellTag: number; className: string}) {
    const hexCellTag = format.Hex(cellTag);

    return (
        <Tooltip
            className={className}
            placement={['top', 'bottom']}
            content={
                <MetaTable
                    items={[
                        {
                            key: 'Hexadecimal cell tag',
                            value: (
                                <>
                                    {hexCellTag}{' '}
                                    <ClipboardButton view="clear" size="xs" text={hexCellTag}>
                                        {hexCellTag}
                                    </ClipboardButton>
                                </>
                            ),
                        },
                        {
                            key: 'Decimal cell tag',
                            value: (
                                <>
                                    {cellTag}{' '}
                                    <ClipboardButton view="clear" size="xs" text={cellTag}>
                                        {cellTag}
                                    </ClipboardButton>
                                </>
                            ),
                        },
                    ]}
                />
            }
        >
            {cellTag && <Icon color="secondary" face="solid" awesome="tag" />}
            {hexCellTag}
            <Secondary> / </Secondary>
            {cellTag}
        </Tooltip>
    );
}
