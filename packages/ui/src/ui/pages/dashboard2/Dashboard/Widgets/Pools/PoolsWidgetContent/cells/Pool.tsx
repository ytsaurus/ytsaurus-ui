import React from 'react';
import {useSelector} from 'react-redux';

import {getCluster} from '../../../../../../../store/selectors/global';

import {GeneralCell} from '../../../../../../../pages/dashboard2/Dashboard/components/GeneralCell/GeneralCell';

import {Page} from '../../../../../../../../shared/constants/settings';

export function PoolCell({pool, tree}: {pool: string; tree: string}) {
    const cluster = useSelector(getCluster);
    const url = `/${cluster}/${Page.SCHEDULING}/overview?pool=${pool}&tree=${tree}`;
    return <GeneralCell url={url} name={`${pool} [${tree}]`} copy />;
}
