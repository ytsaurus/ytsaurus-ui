import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import {openCreateModal} from '../../../../../store/actions/accounts/editor';

import AccountCreateDialog from '../../../../../pages/accounts/tabs/general/Editor/AccountCreateDialog';
import Button from '../../../../../components/Button/Button';

class AccountCreate extends Component {
    static propTypes = {
        openCreateModal: PropTypes.func.isRequired,
        className: PropTypes.string,
    };

    state = {
        infoValue: '',
        activeCreateValue: '',
        showConfirmMessage: false,
        showErrorMessage: false,
    };

    render() {
        const {openCreateModal, className} = this.props;
        return (
            <span className={className}>
                <Button view="action" title="Create account" onClick={openCreateModal}>
                    Create account
                </Button>
                <AccountCreateDialog />
            </span>
        );
    }
}

const mapDispatchToProps = {
    openCreateModal,
};

export default connect(null, mapDispatchToProps)(AccountCreate);
