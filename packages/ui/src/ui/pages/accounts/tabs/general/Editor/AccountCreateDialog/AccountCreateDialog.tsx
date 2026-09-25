import React from 'react';
import {connect} from 'react-redux';
import {closeCreateModal} from '../../../../../../store/actions/accounts/editor';
import {createAccountFromInfo} from '../../../../../../store/actions/accounts/editor-ts';
import {type RootState} from '../../../../../../store/reducers';
import {selectActiveAccount} from '../../../../../../store/selectors/accounts/accounts';
import {selectCurrentUserName} from '../../../../../../store/selectors/global';
import {selectIsAdmin} from '../../../../../../store/selectors/global/is-developer';
import {useAccountEditor} from '../../../../AccountEditorDialog';
import '../AccountCreateDialog.scss';

import {AccountCreateDialogBase, type FormValues} from './AccountCreateDialogBase';

const mapStateToProps = (state: RootState) => {
    const {
        accounts: {editor},
    } = state;
    return {
        currentUserName: selectCurrentUserName(state),
        activeAccount: selectActiveAccount(state),
        visible: editor.createModalVisible,
        newAccountInfo: editor.newAccountInfo as FormValues,
        isAdmin: selectIsAdmin(state),
    };
};

const mapDispatchToProps = {
    closeCreateModal,
    createAccountFromInfo,
};

const ConnectedAccountCreateDialog = connect(
    mapStateToProps,
    mapDispatchToProps,
)(AccountCreateDialogBase);

export function AccountCreateDialog() {
    const {openAccount} = useAccountEditor();
    const handleCreated = React.useCallback(
        (accountName: string) => {
            openAccount(accountName).catch(() => undefined);
        },
        [openAccount],
    );

    return <ConnectedAccountCreateDialog onCreated={handleCreated} />;
}
