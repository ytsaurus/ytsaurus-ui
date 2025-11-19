import React from 'react';

import {YTErrorBlock} from '../../../../../../components/Block/Block';
import {Button} from '@gravity-ui/uikit';
import ConfirmMessage from './../ConfirmMessage';

import {deleteAccount} from '../../../../../../utils/accounts/editor';
import {closeEditorModal} from '../../../../../../store/actions/accounts/accounts';
import {toaster} from '../../../../../../utils/toaster';

type Props = {
    account: {
        name: string;
    } & CypressNode<{recoursive_resource_usage: Record<string, number | Record<string, number>>}>;
};

export function DeleteContent({account}: Props) {
    const dispatch = useDispatch();

    const [state, setState] = React.useState({
        showConfirmMessage: false,
        error: undefined as undefined | YTError,
    });

    const handleDelete = () => {
        deleteAccount(account.name)
            .then(() => {
                setState({
                    activeValue: '',
                });
                dispatch(closeEditorModal());
                toaster.add({
                    name: 'delete account',
                    timeout: 10000,
                    theme: 'success',
                    title: 'Successfully deleted ' + account.name,
                });
            })
            .catch((error) => {
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
    const handleButtonClick = () => setState({showConfirmMessage: true, showErrorMessage: false});

    const {showConfirmMessage, error} = state;

    return (
        <div className="elements-section">
            {error && (
                <YTErrorBlock message={'Failed to delete account: ' + account.name} error={error} />
            )}
            {showConfirmMessage && (
                <ConfirmMessage
                    text={
                        <div className="elements-message__paragraph">
                            Delete account {account.name}
                        </div>
                    }
                    onApply={handleDelete}
                    onCancel={handleCancel}
                />
            )}
            <Button size="m" view="outlined-danger" title={'Delete'} onClick={handleButtonClick}>
                Delete
            </Button>
        </div>
    );
}
