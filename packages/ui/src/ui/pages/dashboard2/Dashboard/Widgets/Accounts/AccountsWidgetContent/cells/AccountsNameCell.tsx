import React from 'react';
import {useSelector} from 'react-redux';

import {getCluster} from '../../../../../../../store/selectors/global';

import {GeneralCell} from '../../../../../../../pages/dashboard2/Dashboard/components/GeneralCell/GeneralCell';

import {Page} from '../../../../../../../../shared/constants/settings';

export function AccountsNameCell({name}: {name: string}) {
    const cluster = useSelector(getCluster);
    const url = `/${cluster}/${Page.ACCOUNTS}/general?account=${name}`;

    return <GeneralCell url={url} name={name} copy />;
}
