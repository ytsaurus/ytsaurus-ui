import React from 'react';
import cn from 'bem-cn-lite';

import UIFactory from '../../../UIFactory';
import {AccountsSuggestWithLoading} from '../AccountsSuggest';
import {selectCluster} from '../../../store/selectors/global';
import {selectIsAdmin} from '../../../store/selectors/global/is-developer';
import {useSelector} from '../../../store/redux-hooks';
import {
    useUpdateAccountAbcMutation,
    useUpdateAccountParentMutation,
} from '../../../store/api/accounts';
import {getAccountSubtreeNames} from '../../../utils/accounts/accounts-tree';
import {type AccountParsedData} from '../../../utils/accounts/accounts-selector';
import contentI18n from '../tabs/general/Editor/content/i18n';
import {type AccountEditorData} from './prepareAccountEditorData';
import {type AccountEditorChange} from './types';

const block = cn('account-editor-dialog');

interface AccountGeneralEditorProps {
    accountName: string;
    data: AccountEditorData;
    onChanged(change: AccountEditorChange): void;
}

export function AccountGeneralEditor({accountName, data, onChanged}: AccountGeneralEditorProps) {
    const cluster = useSelector(selectCluster);
    const isAdmin = useSelector(selectIsAdmin);
    const account = data.accountsByName[accountName];
    const excludedParentAccounts = React.useMemo(
        () => getAccountSubtreeNames(accountName, data.tree),
        [accountName, data.tree],
    );
    const [updateAbc, abcMutation] = useUpdateAccountAbcMutation();
    const [updateParent, parentMutation] = useUpdateAccountParentMutation();

    if (!account) {
        return null;
    }

    const handleAbcChange = async (
        abc?: AccountParsedData['abc'],
        {isOutsideClick}: {isOutsideClick?: boolean} = {},
    ) => {
        if (isOutsideClick || (abc?.id === account.abc.id && abc?.slug === account.abc.slug)) {
            return;
        }

        try {
            await updateAbc({cluster, accountName, abc}).unwrap();
            onChanged({kind: 'abc'});
        } catch {
            // The reused API helper has already shown the mutation error in a toaster.
        }
    };

    const handleParentChange = async (parentName = '') => {
        if (parentName === account.parent) {
            return;
        }

        try {
            await updateParent({cluster, accountName, parentName}).unwrap();
            onChanged({kind: 'parent'});
        } catch {
            // The reused API helper has already shown the mutation error in a toaster.
        }
    };

    const abcControl = UIFactory.renderControlAbcService({
        value: account.abc,
        onChange: handleAbcChange,
        placeholder: contentI18n('field_abc-service-placeholder'),
        disabled: !isAdmin || abcMutation.isLoading,
    });

    return (
        <React.Fragment>
            {abcControl && (
                <EditorSection header={contentI18n('field_abc-service')}>
                    {abcControl}
                </EditorSection>
            )}
            <EditorSection header={contentI18n('field_parent')}>
                <AccountsSuggestWithLoading
                    value={account.parent}
                    onChange={handleParentChange}
                    disabled={!isAdmin || parentMutation.isLoading}
                    excludedAccounts={excludedParentAccounts}
                    allowRootAccount
                />
            </EditorSection>
        </React.Fragment>
    );
}

function EditorSection({header, children}: {header: React.ReactNode; children: React.ReactNode}) {
    return (
        <div className={block('section', 'elements-section')}>
            <div className={block('section-heading', 'elements-heading_size_s')}>{header}</div>
            {children}
        </div>
    );
}
