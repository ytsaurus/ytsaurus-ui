import React, {FC} from 'react';
import {Flex, Icon, Tooltip} from '@gravity-ui/uikit';
import {AccountUsageViewType} from '../../../../store/reducers/accounts/usage/accounts-usage-filters';
import cn from 'bem-cn-lite';
import format from '../../../../common/hammer/format';
import CircleInfoIcon from '@gravity-ui/icons/svgs/circle-info.svg';
import './DetailTableCell.scss';

const block = cn('detail-table-cell');

const getRenderSign = (value: number) => (!value || value < 0 ? '' : '+');
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
    const totalValue = additionalValue ? Number(value) + additionalValue : Number(value);
    const showDiff = viewType.endsWith('-diff');
    const sign = Math.sign(totalValue);

    const formatFn = formatType === 'bytes' ? format.Bytes : format.Number;

    return (
        <Flex justifyContent="center" alignItems="center" gap={1} className={block()}>
            <span className={block('value', {diff: getDiffClass(showDiff, sign)})}>
                {showDiff && getRenderSign(sign)}
                {formatFn(totalValue)}
            </span>
            {Boolean(additionalValue) && (
                <Tooltip
                    content={`${formatFn(value)} + ${formatFn(additionalValue)} (versioned)`}
                    placement="top"
                >
                    <div tabIndex={0} className={block('alert-icon')}>
                        <Icon data={CircleInfoIcon} size={14} />
                    </div>
                </Tooltip>
            )}
        </Flex>
    );
};
