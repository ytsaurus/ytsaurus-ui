import React, {Component} from 'react';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';
import {Checkbox} from '@gravity-ui/uikit';

import Error from '../../../components/Error/Error';
import Label from '../../../components/Label/Label';
import MetaTable from '../../../components/MetaTable/MetaTable';
import Modal from '../../../components/Modal/Modal';
import {renderText} from '../../../components/templates/utils';

import hammer from '../../../common/hammer';

import './DeletePermissionModal.scss';

const block = cn('navigation-acl-delete-modal');

export default class DeletePermissionModal extends Component {
    static propTypes = {
        // from parent
        idmKind: PropTypes.string,
        path: PropTypes.string.isRequired,
        itemToDelete: PropTypes.shape({
            key: PropTypes.string,
            action: PropTypes.string,
            inherited: PropTypes.bool,
            inheritanceMode: PropTypes.string,
            subjects: PropTypes.arrayOf(PropTypes.string),
            permissions: PropTypes.arrayOf(PropTypes.string),
            columns: PropTypes.arrayOf(PropTypes.string),
        }).isRequired,
        visible: PropTypes.bool.isRequired,
        handleClose: PropTypes.func.isRequired,
        // from connect
        deletePermissions: PropTypes.func.isRequired,
        isPermissionDeleted: PropTypes.bool.isRequired,
        error: PropTypes.object,
        lastItemKey: PropTypes.string,
        aclType: PropTypes.string,
    };

    state = {
        confirm: false,
    };

    checkConfirmDisabled = () => !this.state.confirm;
    toggleConfirm = () => this.setState((prevState) => ({confirm: !prevState.confirm}));

    deleteItem = () => {
        const {idmKind, path, itemToDelete, aclType} = this.props;
        const {
            itemToDelete: {key},
            deletePermissions,
        } = this.props;
        return deletePermissions({
            roleKey: key,
            idmKind,
            path,
            itemToDelete,
            aclType,
        }).then((error) => {
            if (!error) {
                this.onClose();
            }
        });
    };

    onClose = () => {
        const {handleClose} = this.props;
        this.setState(() => ({confirm: false}));
        handleClose();
    };

    render() {
        const {confirm} = this.state;
        const {visible, itemToDelete, isPermissionDeleted, error, lastItemKey} = this.props;
        const {key, type, inherited, subjects, permissions, columns, inheritanceMode} =
            itemToDelete;

        return (
            <Modal
                onConfirm={this.deleteItem}
                loading={isPermissionDeleted}
                visible={visible}
                confirmText="Delete"
                onCancel={this.onClose}
                title="Delete permissions"
                onOutsideClick={this.onClose}
                isConfirmDisabled={this.checkConfirmDisabled}
                content={
                    <div className={block()}>
                        <MetaTable
                            className={block('meta')}
                            items={[
                                {
                                    key: 'inherited',
                                    value: String(inherited),
                                },
                                {
                                    key: 'subjects',
                                    value: renderText(subjects?.join(', ')),
                                },
                                {
                                    key: 'permissions',
                                    value: renderText(permissions?.join(', ')),
                                    visible: type === 'object',
                                },
                                {
                                    key: 'private columns',
                                    value: renderText(columns?.join(', ')),
                                    visible: type === 'columns',
                                },
                                {
                                    key: 'inheritance mode',
                                    value:
                                        hammer.format['ReadableField'](inheritanceMode) ||
                                        hammer.format.NO_VALUE,
                                    visible: type === 'object',
                                },
                            ]}
                        />

                        <p className={block('delete', {confirm})}>
                            <Checkbox
                                size={'l'}
                                content="Yes, I'm sure"
                                checked={confirm}
                                onChange={this.toggleConfirm}
                            />

                            <Label theme="danger" text="This action CANNOT be undone" />
                        </p>

                        {error && key === lastItemKey && (
                            <Error message="Could not delete permission" error={error} />
                        )}
                    </div>
                }
            />
        );
    }
}
