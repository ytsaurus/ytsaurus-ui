import React from 'react';
import {useSelector} from '../../../../../../../store/redux-hooks';

import {getCluster} from '../../../../../../../store/selectors/global';

import {QueryStatusIcon} from '../../../../../../../components/QueryStatus';

import {GeneralCell} from '../../../../../../../pages/dashboard2/Dashboard/components/GeneralCell/GeneralCell';

import {Page} from '../../../../../../../../shared/constants/settings';
import {QueryStatus} from '../../../../../../../types/query-tracker';

type Props = {
    name: string;
    state: QueryStatus;
    id: string;
};

export function General({name, state, id}: Props) {
    const cluster = useSelector(getCluster);
    const url = `/${cluster}/${Page.QUERIES}/${id}`;
    return <GeneralCell url={url} name={name} startIcon={<QueryStatusIcon status={state} />} />;
}
