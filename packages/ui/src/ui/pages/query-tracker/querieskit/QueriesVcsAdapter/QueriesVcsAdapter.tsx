import React from 'react';
import {QueriesVcs} from '@gravity-ui/querieskit/modules/QueriesVcs';
import {useQueriesVcsProps} from './useQueriesVcsProps';

type Props = {active: boolean};

export function QueriesVcsAdapter({active}: Props) {
    const props = useQueriesVcsProps({active});
    return <QueriesVcs {...props} />;
}
