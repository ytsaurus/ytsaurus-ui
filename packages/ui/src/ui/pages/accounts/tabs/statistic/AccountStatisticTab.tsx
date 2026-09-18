import React from 'react';
import {useSelector} from '../../../../store/redux-hooks';

import AccountsNoContent from '../../../../pages/accounts/AccountsNoContent';
import {selectCluster, selectTheme} from '../../../../store/selectors/global';
import {selectActiveAccount} from '../../../../store/selectors/accounts/accounts';
import UIFactory from '../../../../UIFactory';
import i18n from './i18n';
import {useAccountAttributes} from '../../useAccountAttributes';
import {YTApiId} from '../../../../rum/rum-wrap-api';
import ypath from '../../../../common/thor/ypath';
import {YTErrorBlock, type YTErrorBlockProps} from '../../../../containers/Block/Block';
import {useGetQuery} from '../../../../store/api/yt/get';
import {fieldTreeForEach} from '../../../../common/hammer/field-tree';

interface AccountTree {
    [name: string]: AccountTree;
}

function collectAccountNames(account: string, tree?: AccountTree): Array<string> {
    const result = [account];

    fieldTreeForEach<never>(
        tree ?? {},
        (_value): _value is never => false,
        (path) => result.push(path[path.length - 1]),
    );
    return result;
}

function useAccountSubtreeNames(account: string, accountPath?: string) {
    const {currentData: tree, error} = useGetQuery<AccountTree>(
        {
            id: YTApiId.accountsData,
            parameters: {path: accountPath || ''},
        },
        {skip: !account || !accountPath},
    );
    const names = React.useMemo(
        () => (account ? collectAccountNames(account, ypath.getValue(tree)) : []),
        [account, tree],
    );

    return {names, error};
}

function AccountStatisticTab() {
    const cluster = useSelector(selectCluster);
    const account = useSelector(selectActiveAccount);
    const theme = useSelector(selectTheme);
    const {data: accountAttributes, error: attributesError} = useAccountAttributes(account);
    const {names: accountSubtreeAllNames, error: subtreeError} = useAccountSubtreeNames(
        account,
        accountAttributes?.path,
    );

    if (!account) {
        return <AccountsNoContent hint={i18n('context_choose-account')} />;
    }

    if (attributesError || subtreeError) {
        return (
            <YTErrorBlock error={(attributesError || subtreeError) as YTErrorBlockProps['error']} />
        );
    }

    const AccountStatisticsComponent = UIFactory.getStatisticsComponentForAccount();
    if (!AccountStatisticsComponent) {
        return null;
    }

    return (
        <div className={'elements-section'}>
            <AccountStatisticsComponent {...{cluster, account, accountSubtreeAllNames, theme}} />
        </div>
    );
}

export default React.memo(AccountStatisticTab);
