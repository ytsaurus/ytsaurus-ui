import React from 'react';

import Loader from '../../../../../components/Loader/Loader';
import {useSelector} from '../../../../../store/redux-hooks';
import {
    selectAccountUsageListDiffLoading,
    selectAccountUsageListLoading,
    selectAccountUsageTreeDiffLoading,
    selectAccountUsageTreeLoading,
    selectAccountUsageViewType,
} from '../../../../../store/selectors/accounts/account-usage';

const AccountsUsageDetailsListLoader = () => {
    const loading = useSelector(selectAccountUsageListLoading);

    return <Loader visible={loading} />;
};

const AccountsUsageDetailsTreeLoader = () => {
    const loading = useSelector(selectAccountUsageTreeLoading);

    return <Loader visible={loading} />;
};

const AccountsUsageDetailsListDiffLoader = () => {
    const loading = useSelector(selectAccountUsageListDiffLoading);

    return <Loader visible={loading} />;
};

const AccountsUsageDetailsTreeDiffLoader = () => {
    const loading = useSelector(selectAccountUsageTreeDiffLoading);

    return <Loader visible={loading} />;
};

const AccountsUsageDetailsListLoaderMemo = React.memo(AccountsUsageDetailsListLoader);
const AccountsUsageDetailsTreeLoaderMemo = React.memo(AccountsUsageDetailsTreeLoader);

const UsageLoaderImpl = () => {
    const viewType = useSelector(selectAccountUsageViewType);

    switch (viewType) {
        case 'list':
        case 'list-plus-folders':
            return <AccountsUsageDetailsListLoaderMemo />;

        case 'tree':
            return <AccountsUsageDetailsTreeLoaderMemo />;

        case 'tree-diff':
            return <AccountsUsageDetailsTreeDiffLoader />;

        case 'list-diff':
        case 'list-plus-folders-diff':
            return <AccountsUsageDetailsListDiffLoader />;
    }

    return null;
};

export const UsageLoader = React.memo(UsageLoaderImpl);
