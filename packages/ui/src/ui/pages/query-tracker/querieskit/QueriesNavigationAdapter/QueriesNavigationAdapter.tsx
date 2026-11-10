import React from 'react';
import {QueriesNavigation} from '@gravity-ui/querieskit/widgets/QueriesNavigation';
import {useQueriesNavigationProps} from './useQueriesNavigationProps';

type Props = {active: boolean};

export function QueriesNavigationAdapter({active}: Props) {
    const {props, modal} = useQueriesNavigationProps(active);
    return (
        <>
            <QueriesNavigation {...props} />
            {modal}
        </>
    );
}
