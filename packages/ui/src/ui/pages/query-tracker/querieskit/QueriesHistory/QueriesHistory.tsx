import React from 'react';
import {QueriesHistory as KitQueriesHistory} from '@gravity-ui/querieskit/widgets/QueriesHistory';
import {useQueriesHistoryProps} from './useQueriesHistoryProps';

type Props = {active: boolean};

export function QueriesHistory({active}: Props) {
    const props = useQueriesHistoryProps(active);
    return <KitQueriesHistory {...props} />;
}
