import * as React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import AccountsNoContent from '../../../../pages/accounts/AccountsNoContent';

import {getActiveAccount} from '../../../../store/selectors/accounts/accounts';
import {fetchAccounts} from '../../../../store/actions/accounts/accounts';
import {loadUsers} from '../../../../store/actions/accounts/editor';
import {AccountsAcl} from '../../../../containers/ACL';

AccountsAclTab.propTypes = {
    activeAccount: PropTypes.string,
    fetchAccounts: PropTypes.func,
};

function AccountsAclTab(props) {
    const {activeAccount} = props;
    if (!activeAccount) {
        return <AccountsNoContent hint="Choose an account to display its ACL" />;
    }

    return <AccountsAcl path={activeAccount} />;
}

const mapAccountsAclTabStateToProps = (state) => {
    return {
        activeAccount: getActiveAccount(state),
    };
};

export default connect(mapAccountsAclTabStateToProps, {
    fetchAccounts,
    loadUsers,
})(AccountsAclTab);
