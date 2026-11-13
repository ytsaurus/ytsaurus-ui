import React from 'react';
import {TutorialsHistory} from '@gravity-ui/querieskit/widgets/TutorialsHistory';
import {useQueriesTutorialsProps} from './useQueriesTutorialsProps';

type Props = {active: boolean};

export function QueriesTutorials({active}: Props) {
    const props = useQueriesTutorialsProps(active);
    return <TutorialsHistory {...props} />;
}
