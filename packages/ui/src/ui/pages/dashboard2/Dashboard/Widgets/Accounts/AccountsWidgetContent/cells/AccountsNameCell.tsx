import React from 'react';
import {useSelector} from '../../../../../../../store/redux-hooks';

import {Page} from '../../../../../../../../shared/constants/settings';

import {getCluster} from '../../../../../../../store/selectors/global';

import {GeneralCell} from '../../../../../../../pages/dashboard2/Dashboard/components/GeneralCell/GeneralCell';

import {YTError} from '../../../../../../../types';

export function AccountsNameCell({name, error}: {name: string; error?: YTError}) {
    const cluster = useSelector(getCluster);
    const url = `/${cluster}/${Page.ACCOUNTS}/general?account=${name}`;

    return <GeneralCell error={error} url={url} name={name} copy />;
}
