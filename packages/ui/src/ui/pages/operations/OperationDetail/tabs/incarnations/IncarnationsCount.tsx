import React from 'react';
import {useSelector} from 'react-redux';

import {getIncarnationsInfo} from '../../../../../store/selectors/operations/incarnations';
import {getOperation} from '../../../../../store/selectors/operations/operation';
import {RootState} from '../../../../../store/reducers';

import UIFactory from '../../../../../UIFactory';

import {
    incarnationsCountCn,
    incarnationsCountItemCn,
    incarnationsCountItemCountCn,
    incarnationsCountTypeCn,
} from './constants';

import './Incarnations.scss';

export function IncarnationsCount() {
    const operation = useSelector(getOperation);

    const {incarnations} = useSelector((state: RootState) =>
        getIncarnationsInfo(state, {
            operation_id: operation.id,
            event_type: 'incarnation_started',
        }),
    );

    const telemetrySetup = UIFactory.IncarnationsTelemetrySetup;
    return (
        <ul className={incarnationsCountCn}>
            <li className={incarnationsCountItemCn}>
                <span className={incarnationsCountTypeCn}>All</span>
                <span className={incarnationsCountItemCountCn}>{incarnations?.length || 0}</span>
            </li>
            {telemetrySetup?.hasTelemtery(operation) && telemetrySetup?.renderCount()}
        </ul>
    );
}
