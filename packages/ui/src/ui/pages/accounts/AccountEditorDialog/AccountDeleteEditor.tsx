import React from 'react';
import cn from 'bem-cn-lite';
import {Button} from '@gravity-ui/uikit';

import {type YTError} from '../../../../@types/types';
import {YTErrorBlock} from '../../../containers/Block/Block';
import {selectCluster} from '../../../store/selectors/global';
import {useSelector} from '../../../store/redux-hooks';
import {useDeleteAccountMutation} from '../../../store/api/accounts';
import {collectAccountResourceUsagePaths} from '../../../utils/accounts/account-delete';
import {toaster} from '../../../utils/toaster';
import ConfirmMessage from '../tabs/general/Editor/ConfirmMessage';
import contentI18n from '../tabs/general/Editor/content/i18n';
import {type AccountEditorAccount} from './prepareAccountEditorData';

import '../tabs/general/Editor/content/DeleteContent.scss';

const block = cn('yt-accounts-editor-delete-content');

interface AccountDeleteEditorProps {
    account: AccountEditorAccount;
    onDeleted(): void;
}

export function AccountDeleteEditor({account, onDeleted}: AccountDeleteEditorProps) {
    const cluster = useSelector(selectCluster);
    const [deleteAccount, {isLoading}] = useDeleteAccountMutation();
    const [showConfirmMessage, setShowConfirmMessage] = React.useState(false);
    const [error, setError] = React.useState<YTError>();
    const [resourceUsagePaths, setResourceUsagePaths] = React.useState<Array<string>>([]);
    const hasResourceUsage = resourceUsagePaths.length > 0;

    const handleDelete = async () => {
        setError(undefined);
        try {
            await deleteAccount({cluster, accountName: account.name}).unwrap();
            toaster.add({
                name: 'delete account',
                theme: 'success',
                title: contentI18n('alert_delete-success', {name: account.name}),
            });
            onDeleted();
        } catch (mutationError) {
            setError(mutationError as YTError);
        }
    };

    const handleButtonClick = () => {
        setResourceUsagePaths(collectAccountResourceUsagePaths(account));
        setShowConfirmMessage(true);
    };

    return (
        <div className="elements-section">
            {error && (
                <YTErrorBlock
                    message={contentI18n('alert_delete-error', {name: account.name})}
                    error={error}
                />
            )}
            {showConfirmMessage && (
                <ConfirmMessage
                    text={
                        hasResourceUsage ? (
                            <React.Fragment>
                                {contentI18n('confirm_resources-in-use')}
                                {resourceUsagePaths.map((path) => (
                                    <div className={block('resource-to-free')} key={path}>
                                        {path}
                                    </div>
                                ))}
                            </React.Fragment>
                        ) : (
                            <div className="elements-message__paragraph">
                                {contentI18n('confirm_delete-account', {name: account.name})}
                            </div>
                        )
                    }
                    confirmQuestion={hasResourceUsage ? '' : undefined}
                    onApply={hasResourceUsage ? undefined : handleDelete}
                    onCancel={hasResourceUsage ? undefined : () => setShowConfirmMessage(false)}
                />
            )}
            <Button
                size="m"
                view="outlined-danger"
                title={contentI18n('action_delete')}
                onClick={handleButtonClick}
                disabled={hasResourceUsage || isLoading}
                loading={isLoading}
            >
                {contentI18n('action_delete')}
            </Button>
        </div>
    );
}
