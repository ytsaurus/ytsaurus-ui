import React from 'react';
import {useSelector} from 'react-redux';
import _ from 'lodash';
import cn from 'bem-cn-lite';

import {getOperationStatisticsDescription} from '../../../../../store/selectors/global/supported-features';
import MetaTable from '../../../../../components/MetaTable/MetaTable';
import {Tooltip} from '../../../../../components/Tooltip/Tooltip';
import Icon from '../../../../../components/Icon/Icon';
import {Secondary} from '../../../../../components/Text/Text';
import format from '../../../../../common/hammer/format';

import './OperationStatisticName.scss';

const block = cn('operation-statistc-name');

function useStatisticInfo(name: string) {
    const {byName, byRegexp} = useSelector(getOperationStatisticsDescription);

    const info = React.useMemo(() => {
        const key = name.startsWith('<Root>/') ? name.substring('<Root>/'.length) : name;
        const res = key.endsWith('/$$') ? byName[key.substring(0, key.length - 3)] : byName[key];
        if (res) {
            return res;
        }

        return _.find(byRegexp, ({regexp}) => {
            return regexp.test(key);
        });
    }, [name, byName, byRegexp]);

    return info;
}

function OperationStatisticNameImpl({name, title}: {name: string; title: string}) {
    const info = useStatisticInfo(name);
    const emptyInfo = !info?.description && !info?.unit;

    return (
        <Tooltip
            content={
                emptyInfo ? null : (
                    <MetaTable
                        items={[
                            {
                                key: 'Description',
                                value: info.description,
                                visible: Boolean(info.description),
                                className: block('description'),
                            },
                            {
                                key: 'Unit',
                                value: info.unit,
                                visible: Boolean(info.unit),
                            },
                        ]}
                    />
                )
            }
        >
            {title}{' '}
            {!emptyInfo && (
                <Secondary>
                    <Icon awesome={'question-circle'} />
                </Secondary>
            )}
        </Tooltip>
    );
}

const UNIT_TO_FORMATTER: Record<string, (v?: number, settings?: object) => string> = {
    ['ms']: (v, settings) =>
        format.TimeDuration(Math.round(v!), {format: 'milliseconds', ...settings}),
    ['bytes']: (v, settings) => formatBytes(v, settings),
    ['bytes * sec']: (v, settings) => formatBytes(v, settings, ' * sec'),
    ['ms * bytes']: (v, settings) => formatBytes(v, settings, ' * ms'),
    ['Mb*sec']: (v, settings) => formatBytes(v! * 1024 * 1024, settings, ' * sec'),
};

function formatBytes(v?: number, settings?: object, suffix = '') {
    return isNaN(v!) ? format.NO_VALUE : format.Bytes(Math.round(v!), settings) + suffix;
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
    const formatFn = UNIT_TO_FORMATTER[info?.unit || ''];

    const asNumber = format.Number(value, settings);

    return formatFn ? <Tooltip content={asNumber}>{formatFn(value, settings)}</Tooltip> : asNumber;
}

export const OperationStatisticValue = React.memo(OperationStatisticValueImpl);
export const OperationStatisticName = React.memo(OperationStatisticNameImpl);
