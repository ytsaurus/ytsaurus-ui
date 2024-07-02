import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import Error from '../../../../../../components/Error/Error';
import {Button, Toaster} from '@gravity-ui/uikit';
import ConfirmMessage from './../ConfirmMessage';

import {deleteAccount} from '../../../../../../utils/accounts/editor';
import {closeEditorModal} from '../../../../../../store/actions/accounts/accounts';

const toaster = new Toaster();

class DeleteContent extends Component {
    static propTypes = {
        //from parent
        account: PropTypes.object.isRequired,
        //from connect
        deleteModalVisible: PropTypes.bool.isRequired,
        closeEditorModal: PropTypes.func.isRequired,
    };

    state = {
        showConfirmMessage: false,
        error: undefined,
    };

    handleDelete = () => {
        const {account, closeEditorModal} = this.props;

        deleteAccount(account.name)
            .then(() => {
                this.setState({
                    activeValue: '',
                });
                closeEditorModal();
                toaster.add({
                    name: 'delete account',
                    timeout: 10000,
                    theme: 'success',
                    title: 'Successfully deleted ' + account.name,
                });
            })
            .catch((error) => {
                this.setState({
                    error,
                });
            });

        this.setState({
            error: undefined,
        });
    };

    handleCancel = () => this.setState({showConfirmMessage: false});
    handleButtonClick = () => this.setState({showConfirmMessage: true, showErrorMessage: false});

    render() {
        const {account} = this.props;
        const {showConfirmMessage, error} = this.state;

        return (
            <div className="elements-section">
                {error && (
                    <Error message={'Failed to delete account: ' + account.name} error={error} />
                )}
                {showConfirmMessage && (
                    <ConfirmMessage
                        text={
                            <div className="elements-message__paragraph">
                                Delete account {account.name}
                            </div>
                        }
                        onApply={this.handleDelete}
                        onCancel={this.handleCancel}
                    />
                )}
                <Button
                    size="m"
                    view="outlined-danger"
                    title={'Delete'}
                    onClick={this.handleButtonClick}
                >
                    Delete
                </Button>
            </div>
        );
    }
}

export default connect(null, {closeEditorModal})(DeleteContent);
