import React from 'react';
import {useSelector} from 'react-redux';

import {getOperationStatisticsDescription} from '../../../../../store/selectors/global/supported-features';
import {Tooltip} from '../../../../../components/Tooltip/Tooltip';
import format from '../../../../../common/hammer/format';
import {StatisticName, formatByUnit} from '../../../../../components/StatisticTable';

function useStatisticInfo(name: string) {
    const {getStatisticInfo} = useSelector(getOperationStatisticsDescription);
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

    return asStr !== undefined ? <Tooltip content={asNumber}>{asStr}</Tooltip> : asNumber;
}

export const OperationStatisticValue = React.memo(OperationStatisticValueImpl);
export const OperationStatisticName = React.memo(OperationStatisticNameImpl);
