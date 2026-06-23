import React, {type FC} from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import {MetaTable, type MetaTableItem, Tooltip} from '@ytsaurus/components';
import {type AccountUsageViewType} from '../../../../store/reducers/accounts/usage/accounts-usage-filters';
import cn from 'bem-cn-lite';
import format from '../../../../common/hammer/format';
import './DetailTableCell.scss';

const block = cn('detail-table-cell');

const getRenderSign = (value: number) => {
    return !value || value <= 0 ? '' : '+';
};

const getValueClassName = (showDiff: boolean, sign: number) => {
    let diff;

    if (showDiff && sign) {
        diff = sign > 0 ? 'plus' : 'minus';
    }

    return block('value', {diff});
};

type Props = {
    value: number | null;
    versionedValue: number | null;
    viewType: AccountUsageViewType;
    formatType: 'bytes' | 'number';
};

export const DetailTableCell: FC<Props> = ({value, versionedValue, viewType, formatType}) => {
    const totalValue = (value ?? 0) + (versionedValue ?? 0);
    const showDiff = viewType.endsWith('-diff');
    const sign = Math.sign(totalValue);

    const formatFn = formatType === 'bytes' ? format.Bytes : format.Number;

    const valueClassName = getValueClassName(showDiff, sign);

    const formattedTotalValue = formatFn(totalValue);
    const formattedValue = formatFn(value ?? 0);
    const formattedVersionedValue = formatFn(versionedValue ?? 0);

    const content = (
        <Flex direction="column">
            <div className={valueClassName}>
                {showDiff && getRenderSign(sign)}
                {formattedTotalValue}
            </div>

            {versionedValue !== null && (
                <Text variant="caption-2" color="secondary">
                    {formattedValue}, {formattedVersionedValue}
                </Text>
            )}
        </Flex>
    );

    if (versionedValue === null) {
        return content;
    }

    const tooltipItems: Array<MetaTableItem> = [
        {key: 'totalValue', label: 'Total', value: totalValue},
        {key: 'value', label: 'Committed', value},
        {key: 'versionedValue', label: 'Uncommitted', value: versionedValue},
    ];

    return <Tooltip content={<MetaTable items={tooltipItems} />}>{content}</Tooltip>;
};
