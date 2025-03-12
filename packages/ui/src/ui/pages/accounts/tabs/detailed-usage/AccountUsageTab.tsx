import React from 'react';
import cn from 'bem-cn-lite';

import AccountUsageToolbar from './AccountUsageToolbar';
import AccountUsageDetails from './AccountUsageDetails';
import WithStickyToolbar from '../../../../components/WithStickyToolbar/WithStickyToolbar';
import {NoContent} from '../../../../components/NoContent/NoContent';
import {getActiveAccount} from '../../../../store/selectors/accounts/accounts-ts';
import {useSelector} from 'react-redux';
import {getAccountUsageViewType} from '../../../../store/selectors/accounts/account-usage';
import ErrorBoundary from '../../../../components/ErrorBoundary/ErrorBoundary';
import {useDisableMaxContentWidth} from '../../../../containers/MaxContentWidth';

const block = cn('accounts');

function AccountDetailedUsageTab() {
    useDisableMaxContentWidth();

    const account = useSelector(getActiveAccount);
    const viewType = useSelector(getAccountUsageViewType);

    if (!account) {
        return (
            <NoContent
                warning={"You don't have any selected accounts\n"}
                hint={'Please choose one to display charts'}
            />
        );
    }

    return (
        <ErrorBoundary>
            <WithStickyToolbar
                className={block('usage')}
                doubleHeight={viewType === 'tree' || viewType === 'tree-diff'}
                toolbar={<AccountUsageToolbar />}
                content={<AccountUsageDetails />}
            />
        </ErrorBoundary>
    );
}

export default React.memo(AccountDetailedUsageTab);
