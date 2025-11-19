import React from 'react';
import cn from 'bem-cn-lite';

import {Button} from '@gravity-ui/uikit';

import {YTErrorBlock} from '../../../../../../components/Block/Block';
import ConfirmMessage from '../../../../../../pages/accounts/tabs/general/Editor/ConfirmMessage';

import {CypressNode} from '../../../../../../../shared/yt-types';
import {closeEditorModal} from '../../../../../../store/actions/accounts/accounts';
import {useDispatch} from '../../../../../../store/redux-hooks';
import {YTError} from '../../../../../../types';
import {deleteAccount} from '../../../../../../utils/accounts/editor';
import {toaster} from '../../../../../../utils/toaster';
import {FieldTree, fieldTreeForEach} from '../../../../../../common/hammer/field-tree';

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
                    title: 'Successfully deleted ' + account.name,
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
                <YTErrorBlock message={'Failed to delete account: ' + account.name} error={error} />
            )}
            {showConfirmMessage && (
                <ConfirmMessage
                    text={
                        hasResourceUsage ? (
                            <>
                                Please make sure the account is empty. The following resources are
                                still used by the account or its children:
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
                                Delete account {account.name}
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
                title={'Delete'}
                onClick={handleButtonClick}
                disabled={hasResourceUsage}
            >
                Delete
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
