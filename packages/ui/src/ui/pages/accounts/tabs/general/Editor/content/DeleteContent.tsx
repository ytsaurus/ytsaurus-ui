import React from 'react';
import cn from 'bem-cn-lite';

import {Button} from '@gravity-ui/uikit';

import {YTErrorBlock} from '../../../../../../components/Block/Block';
import ConfirmMessage from '../../../../../../pages/accounts/tabs/general/Editor/ConfirmMessage';

import {type CypressNode} from '../../../../../../../shared/yt-types';
import {closeEditorModal} from '../../../../../../store/actions/accounts/accounts';
import {useDispatch} from '../../../../../../store/redux-hooks';
import {type YTError} from '../../../../../../types';
import {deleteAccount} from '../../../../../../utils/accounts/editor';
import {toaster} from '../../../../../../utils/toaster';
import {type FieldTree, fieldTreeForEach} from '../../../../../../common/hammer/field-tree';

import i18n from './i18n';

import './DeleteContent.scss';

const block = cn('yt-accounts-editor-delete-content');

type Props = {
    account: AccountType;
};

type AccountType = CypressNode<{recursive_resource_usage: FieldTree<number>}, unknown> & {
    name: string;
};

export function DeleteContent({account}: Props) {
    const dispatch = useDispatch();

    const [state, setState] = React.useState({
        showConfirmMessage: false,
        error: undefined as undefined | YTError,
        recursiveResourceUsageToFree: [] as Array<string>,
    });

    const handleDelete = () => {
        deleteAccount(account.name)
            .then(() => {
                dispatch(closeEditorModal());
                toaster.add({
                    name: 'delete account',
                    theme: 'success',
                    title: i18n('alert_delete-success', {name: account.name}),
                });
            })
            .catch((error: YTError) => {
                setState((prevState) => {
                    return {
                        ...prevState,
                        error,
                    };
                });
            });

        setState((prevState) => {
            return {
                ...prevState,
                error: undefined,
            };
        });
    };

    const handleCancel = () => {
        setState((prevState) => {
            return {...prevState, showConfirmMessage: false};
        });
    };
    const handleButtonClick = () =>
        setState((prevState) => {
            const recursiveResourceUsageToFree = collectResourceUsagePaths(account);
            return {...prevState, showConfirmMessage: true, recursiveResourceUsageToFree};
        });

    const {showConfirmMessage, error, recursiveResourceUsageToFree} = state;

    const hasResourceUsage = recursiveResourceUsageToFree.length > 0;

    return (
        <div className="elements-section">
            {error && (
                <YTErrorBlock
                    message={i18n('alert_delete-error', {name: account.name})}
                    error={error}
                />
            )}
            {showConfirmMessage && (
                <ConfirmMessage
                    text={
                        hasResourceUsage ? (
                            <>
                                {i18n('confirm_resources-in-use')}
                                {recursiveResourceUsageToFree.map((path, index) => {
                                    return (
                                        <div className={block('resource-to-free')} key={index}>
                                            {path}
                                        </div>
                                    );
                                })}
                            </>
                        ) : (
                            <div className="elements-message__paragraph">
                                {i18n('confirm_delete-account', {name: account.name})}
                            </div>
                        )
                    }
                    confirmQuestion={hasResourceUsage ? '' : undefined}
                    onApply={hasResourceUsage ? undefined : handleDelete}
                    onCancel={hasResourceUsage ? undefined : handleCancel}
                />
            )}
            <Button
                size="m"
                view="outlined-danger"
                title={i18n('action_delete')}
                onClick={handleButtonClick}
                disabled={hasResourceUsage}
            >
                {i18n('action_delete')}
            </Button>
        </div>
    );
}

function collectResourceUsagePaths(account: AccountType) {
    const res = new Set<string>();
    fieldTreeForEach(
        account.$attributes.recursive_resource_usage,
        (v) => {
            return typeof v === 'number';
        },
        (path, _tee, item) => {
            if (item! > 0) {
                res.add(path.join('/'));
            }
        },
    );
    return [...res];
}
