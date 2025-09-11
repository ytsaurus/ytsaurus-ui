import React from 'react';
import {useSelector} from 'react-redux';

import {getIncarnationsInfo} from '../../../../../store/selectors/operations/incarnations';

import {
    incarnationsCountCn,
    incarnationsCountItemCn,
    incarnationsCountItemCountCn,
    incarnationsCountTypeCn,
} from './constants';

import './Incarnations.scss';

export type IncarnationsCountProps = {
    items: Array<{
        name: string;
        count: number;
    }>;
};

export function IncarnationsCount() {
    const {count} = useSelector(getIncarnationsInfo);

    return (
        <IncarnationsCountTemplate
            items={[
                {
                    name: 'All',
                    count: count || 0,
                },
            ]}
        />
    );
}

export function IncarnationsCountTemplate(props: IncarnationsCountProps) {
    const {items} = props;

    return (
        <ul className={incarnationsCountCn}>
            {items.map((item) => (
                <li key={`${item.name} ${item.count}`} className={incarnationsCountItemCn}>
                    <span className={incarnationsCountTypeCn}>{item.name}</span>
                    <span className={incarnationsCountItemCountCn}>{item.count}</span>
                </li>
            ))}
        </ul>
    );
}
