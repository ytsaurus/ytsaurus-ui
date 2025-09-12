import React from 'react';
import {useSelector} from 'react-redux';

import {CountsList} from '../../../../../components/CountsList/CountsList';

import {getIncarnationsInfo} from '../../../../../store/selectors/operations/incarnations';

import i18n from './i18n';

export type IncarnationsCountProps = {
    items: Array<{
        type: string;
        count: number;
    }>;
};

export function IncarnationsCount() {
    const {count} = useSelector(getIncarnationsInfo);

    return (
        <IncarnationsCountTemplate
            items={[
                {
                    type: i18n('all'),
                    count: count || 0,
                },
            ]}
        />
    );
}

export function IncarnationsCountTemplate(props: IncarnationsCountProps) {
    const {items} = props;

    return <CountsList hideAll items={items} />;
}
