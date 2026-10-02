import React from 'react';

import {AccountQuotaEditor, type Props} from '../AccountQuota/AccountQuotaEditor';
import {selectCluster} from '../../../store/selectors/global';
import {useSelector} from '../../../store/redux-hooks';
import {useUpdateAccountQuotaMutation} from '../../../store/api/accounts';
import {getAccountQuotaSources} from '../../../utils/accounts/accounts-tree';
import {type AccountQuotaParams} from '../../../utils/accounts/account-quota';
import {type AccountEditorData} from './prepareAccountEditorData';
import {type AccountEditorChange} from './types';

interface AccountQuotaMutationEditorProps extends Props {
    data: AccountEditorData;
    onChanged(change: AccountEditorChange): void;
}

export function AccountQuotaMutationEditor({
    data,
    onChanged,
    ...props
}: AccountQuotaMutationEditorProps) {
    const cluster = useSelector(selectCluster);
    const [updateQuota, {isLoading}] = useUpdateAccountQuotaMutation();
    const sources = React.useMemo(
        () => getAccountQuotaSources(props.currentAccount, data.tree),
        [data.tree, props.currentAccount],
    );

    const handleSetQuota = React.useCallback(
        async (params: AccountQuotaParams) => {
            try {
                await updateQuota({...params, cluster}).unwrap();
                onChanged({kind: 'quota'});
            } catch {
                // The mutation is reported by the existing quota toaster wrapper.
            }
        },
        [cluster, onChanged, updateQuota],
    );

    return (
        <AccountQuotaEditor
            {...props}
            activeAccount={props.currentAccount}
            accountsTree={data.tree}
            setAccountQuota={handleSetQuota}
            sources={sources}
            isLoading={isLoading}
        />
    );
}
