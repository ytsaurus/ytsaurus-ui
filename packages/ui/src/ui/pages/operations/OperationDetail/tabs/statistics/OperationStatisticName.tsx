import React from 'react';
import {useSelector} from '../../../../../store/redux-hooks';
import {Flex} from '@gravity-ui/uikit';

import {selectOperationStatisticsDescription} from '../../../../../store/selectors/global/supported-features';
import {ClipboardButton, Tooltip} from '@ytsaurus/components';
import format from '../../../../../common/hammer/format';
import {StatisticName, formatByUnit} from '../../../../../components/StatisticTable';

function useStatisticInfo(name: string) {
    const {getStatisticInfo} = useSelector(selectOperationStatisticsDescription);
    return getStatisticInfo(name);
}

function OperationStatisticNameImpl({name, title}: {name: string; title: string}) {
    const info = useStatisticInfo(name);

    return <StatisticName title={title} info={info} />;
}

function OperationStatisticValueImpl({
    name,
    settings,
    value,
}: {
    value?: number;
    name: string;
    settings?: {significantDigits: number};
}) {
    const info = useStatisticInfo(name);
    const asStr = formatByUnit(value, info?.unit, settings);
    const asNumber = format.Number(value, settings);

    return asStr !== undefined ? (
        <Tooltip
            placement={['right', 'left']}
            content={
                <Flex gap={1}>
                    <span> {asNumber}</span>
                    {!isNaN(value!) && (
                        <ClipboardButton text={`${value}`} inlineMargins view="outlined" />
                    )}
                </Flex>
            }
        >
            {asStr}
        </Tooltip>
    ) : (
        asNumber
    );
}

export const OperationStatisticValue = React.memo(OperationStatisticValueImpl);
export const OperationStatisticName = React.memo(OperationStatisticNameImpl);
