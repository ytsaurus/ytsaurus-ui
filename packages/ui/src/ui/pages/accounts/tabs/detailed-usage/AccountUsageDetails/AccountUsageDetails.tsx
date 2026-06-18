import React, {type ReactNode, useEffect} from 'react';

import {syncAccountsUsageViewTypeWithSettings} from '../../../../../store/actions/accounts/account-usage';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import {selectAccountUsageViewType} from '../../../../../store/selectors/accounts/account-usage';

import {AccountUsageDetailsDiff} from './AccountUsageDetailsDiff';
import {AccountUsageDetailsList} from './AccountUsageDetailsList';
import {AccountUsageDetailsListDiff} from './AccountUsageDetailsListDiff';
import {AccountUsageDetailsTree} from './AccountUsageDetailsTree';
import {AccountUsageDetailsTreeDiff} from './AccountUsageDetailsTreeDiff';

import './AccountUsageDetails.scss';

const AccountUsageDetailsImpl = () => {
    const dispatch = useDispatch();

    const viewType = useSelector(selectAccountUsageViewType);

    useEffect(() => {
        dispatch(syncAccountsUsageViewTypeWithSettings());
    }, [dispatch]);

    if (!viewType) {
        return null;
    }

    let diffContent = `${viewType} is not implemented` as ReactNode;

    switch (viewType) {
        case 'tree':
            return <AccountUsageDetailsTree />;

        case 'list-plus-folders':
        case 'list':
            return <AccountUsageDetailsList key={viewType} />;

        case 'list-diff':
        case 'list-plus-folders-diff':
            diffContent = <AccountUsageDetailsListDiff key={viewType} />;
            break;

        case 'tree-diff':
            diffContent = <AccountUsageDetailsTreeDiff />;
            break;
    }

    return <AccountUsageDetailsDiff>{diffContent}</AccountUsageDetailsDiff>;
};

export const AccountUsageDetails = React.memo(AccountUsageDetailsImpl);
