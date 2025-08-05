import React from 'react';

import format from '../../../common/hammer/format';

import Icon from '../../../components/Icon/Icon';
import {Secondary} from '../../../components/Text/Text';
import {Tooltip} from '../../../components/Tooltip/Tooltip';
import MetaTable from '../../../components/MetaTable/MetaTable';
import ClipboardButton from '../../../components/ClipboardButton/ClipboardButton';

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
                                    <ClipboardButton view="clear" theme="" size="xs" text={cellTag}>
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
