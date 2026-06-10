import React from 'react';

import format from '../../../common/hammer/format';

import Icon from '../../../components/Icon/Icon';
import {ClipboardButton, MetaTable, Secondary, Tooltip} from '@ytsaurus/components';
import i18n from './i18n/index-cell-tag';

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
                            key: i18n('field_hexadecimal-cell-tag'),
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
                            key: i18n('field_decimal-cell-tag'),
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
