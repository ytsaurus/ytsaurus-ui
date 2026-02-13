import CircleInfoIcon from '@gravity-ui/icons/svgs/circle-info.svg';
import {Flex, Icon, Text, Tooltip} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React, {FC} from 'react';
import format from '../../../../common/hammer/format';
import MetaTable from '../../../../components/MetaTable/MetaTable';
import {AccountUsageViewType} from '../../../../store/reducers/accounts/usage/accounts-usage-filters';
import './DetailTableCell.scss';
import i18n from './i18n';

const block = cn('detail-table-cell');

const getRenderSign = (value: number) => (!value || value < 0 ? '' : '+');
const getDiffClass = (showDiff: boolean, sign: number) => {
    if (!showDiff || !sign) return undefined;
    return sign > 0 ? 'plus' : 'minus';
};

type Props = {
    value: number | null;
    additionalValue: number | null;
    viewType?: AccountUsageViewType;
    formatType: 'bytes' | 'number';
};

export const DetailTableCell: FC<Props> = ({value, additionalValue, viewType, formatType}) => {
    const totalValue = additionalValue ? Number(value) + additionalValue : Number(value);
    const showDiff = viewType?.endsWith('-diff');
    const sign = Math.sign(totalValue);

    const formatFn = formatType === 'bytes' ? format.Bytes : format.Number;
    const commited = formatFn(value);
    const uncommited = formatFn(additionalValue);

    return (
        <Flex className={block({versioned: Boolean(additionalValue)})} direction="column">
            <Flex alignItems="center" gap={1} className={block()}>
                <span className={block('value', {diff: getDiffClass(Boolean(showDiff), sign)})}>
                    {showDiff && getRenderSign(sign)}
                    {formatFn(totalValue)}
                </span>
                {Boolean(additionalValue) && (
                    <Tooltip
                        content={
                            additionalValue ? (
                                <MetaTable
                                    items={[
                                        {key: i18n('commited'), value: commited},
                                        {
                                            key: i18n('versioned'),
                                            value: uncommited,
                                        },
                                    ]}
                                />
                            ) : null
                        }
                        placement="top"
                    >
                        <span tabIndex={0} className={block('alert-icon')}>
                            <Icon data={CircleInfoIcon} size={14} />
                        </span>
                    </Tooltip>
                )}
            </Flex>
            {Boolean(additionalValue) && (
                <Text variant="caption-2" color="secondary">
                    {commited}, {uncommited}
                </Text>
            )}
        </Flex>
    );
};
