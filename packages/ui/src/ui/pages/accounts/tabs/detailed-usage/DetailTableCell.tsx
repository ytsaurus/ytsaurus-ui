import React, {type FC} from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import {type AccountUsageViewType} from '../../../../store/reducers/accounts/usage/accounts-usage-filters';
import cn from 'bem-cn-lite';
import format from '../../../../common/hammer/format';
import './DetailTableCell.scss';

const block = cn('detail-table-cell');

const getRenderSign = (value: number) => {
    return value <= 0 ? '' : '+';
};

const getDiffClass = (showDiff: boolean, sign: number) => {
    if (!showDiff || !sign) return undefined;

    return sign > 0 ? 'plus' : 'minus';
};

type Props = {
    value: number | null;
    additionalValue: number | null;
    viewType: AccountUsageViewType;
    formatType: 'bytes' | 'number';
};

export const DetailTableCell: FC<Props> = ({value, additionalValue, viewType, formatType}) => {
    const totalValue = (value ?? 0) + (additionalValue ?? 0);
    const showDiff = viewType.endsWith('-diff');
    const sign = Math.sign(totalValue);

    const formatFn = formatType === 'bytes' ? format.Bytes : format.Number;

    const valueClassName = block('value', {diff: getDiffClass(showDiff, sign)});

    return (
        <Flex direction="column" alignItems="flex-end" className={block()}>
            <span className={valueClassName}>
                {showDiff && getRenderSign(sign)}
                {formatFn(totalValue)}
            </span>

            {additionalValue !== null && (
                <Text variant="caption-2" color="secondary">
                    {formatFn(value ?? 0)}, {formatFn(additionalValue)}
                </Text>
            )}
        </Flex>
    );
};
