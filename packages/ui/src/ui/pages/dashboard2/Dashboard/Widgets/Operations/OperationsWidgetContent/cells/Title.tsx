import React from 'react';
import {useSelector} from '../../../../../../../store/redux-hooks';

import {getCluster} from '../../../../../../../store/selectors/global';

import {GeneralCell} from '../../../../../../../pages/dashboard2/Dashboard/components/GeneralCell/GeneralCell';

import {Page} from '../../../../../../../../shared/constants/settings';

export function Title({title: {title, id}}: {title: {title: string; id: string}}) {
    const cluster = useSelector(getCluster);
    const url = `/${cluster}/${Page.OPERATIONS}/${id}/details`;
    return <GeneralCell url={url} name={title} copy />;
}
