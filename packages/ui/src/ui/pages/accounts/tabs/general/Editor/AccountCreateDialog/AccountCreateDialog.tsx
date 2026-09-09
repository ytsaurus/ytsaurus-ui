import {connect} from 'react-redux';
import {loadEditedAccount} from '../../../../../../store/actions/accounts/accounts';
import {closeCreateModal} from '../../../../../../store/actions/accounts/editor';
import {createAccountFromInfo} from '../../../../../../store/actions/accounts/editor-ts';
import {type RootState} from '../../../../../../store/reducers';
import {selectActiveAccount} from '../../../../../../store/selectors/accounts/accounts';
import {selectCurrentUserName} from '../../../../../../store/selectors/global';
import {selectIsAdmin} from '../../../../../../store/selectors/global/is-developer';
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
    loadEditedAccount,
    createAccountFromInfo,
};

export const AccountCreateDialog = connect(
    mapStateToProps,
    mapDispatchToProps,
)(AccountCreateDialogBase);
