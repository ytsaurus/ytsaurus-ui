import React from 'react';
import {useSelector} from '../../../../../store/redux-hooks';

import {CountsList} from '../../../../../components/CountsList/CountsList';

import {selectIncarnationsInfo} from '../../../../../store/selectors/operations/incarnations';

import i18n from './i18n';

export type IncarnationsCountProps = {
    items: Array<{
        type: string;
        count: number;
    }>;
};

export function IncarnationsCount() {
    const {count} = useSelector(selectIncarnationsInfo);

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
