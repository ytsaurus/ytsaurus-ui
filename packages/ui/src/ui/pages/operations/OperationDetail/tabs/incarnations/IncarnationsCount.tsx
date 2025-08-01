import React from 'react';
import {useSelector} from 'react-redux';

import {getIncarnationsInfo} from '../../../../../store/selectors/operations/incarnations';
import {RootState} from '../../../../../store/reducers';

import {
    incarnationsCountCn,
    incarnationsCountItemCn,
    incarnationsCountItemCountCn,
    incarnationsCountTypeCn,
} from './constants';

import './Incarnations.scss';

type Props = {
    operationId: string;
};

export function IncarnationsCount(props: Props) {
    const {operationId} = props;

    const {incarnations} = useSelector((state: RootState) =>
        getIncarnationsInfo(state, {
            operation_id: operationId,
            event_type: 'incarnation_started',
        }),
    );
    return (
        <ul className={incarnationsCountCn}>
            <li className={incarnationsCountItemCn}>
                <span className={incarnationsCountTypeCn}>All</span>
                <span className={incarnationsCountItemCountCn}>{incarnations?.length || 0}</span>
            </li>
            <li className={incarnationsCountItemCn}>
                <span className={incarnationsCountTypeCn}>With external telemetry</span>
                <span className={incarnationsCountItemCountCn}>0</span>
            </li>
        </ul>
    );
}
