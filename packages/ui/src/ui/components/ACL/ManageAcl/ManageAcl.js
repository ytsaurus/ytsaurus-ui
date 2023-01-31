import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {compose} from 'redux';
import cn from 'bem-cn-lite';

import _isEqual from 'lodash/isEqual';

import Dialog from '../../../components/Dialog/Dialog';
import {Dialog as CommonDialog, Loader} from '@gravity-ui/uikit';
import {
    prepareRoleListValue,
    roleListValueToSubjectList,
} from '../../../components/Dialog/controls/RoleListControl/RoleListControl';

import LoadDataHandler from '../../../components/LoadDataHandler/LoadDataHandler';
import Error from '../../../components/Error/Error';
import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import Button from '../../../components/Button/Button';

import withVisible from '../../../hocs/withVisible';

import {PERMISSIONS_SETTINGS} from '../../../constants/acl';

import './ManageAcl.scss';

const block = cn('acl-manage');

class ManageAcl extends Component {
    static propTypes = {
        // loading
        loadAclData: PropTypes.func.isRequired,
        loading: PropTypes.bool.isRequired,
        loaded: PropTypes.bool.isRequired,
        error: PropTypes.bool.isRequired,
        errorData: PropTypes.object.isRequired,

        // from parent
        className: PropTypes.string,

        path: PropTypes.string.isRequired,
        idmKind: PropTypes.string.isRequired,
        version: PropTypes.string.isRequired,

        auditors: PropTypes.arrayOf(PropTypes.object),
        responsible: PropTypes.arrayOf(PropTypes.object),
        readApprovers: PropTypes.arrayOf(PropTypes.object),
        inheritAcl: PropTypes.bool, // Not applicable for accounts
        bossApproval: PropTypes.object,
        disableInheritanceResponsible: PropTypes.object,

        updateAcl: PropTypes.func.isRequired,
        manageAclError: PropTypes.object,
        cancelUpdateAcl: PropTypes.func.isRequired,

        // from withVisible
        visible: PropTypes.bool.isRequired,
        handleClose: PropTypes.func.isRequired,
        handleShow: PropTypes.func.isRequired,
    };

    handleModalOpen = () => {
        const {handleShow, loadAclData, path, idmKind} = this.props;

        loadAclData({path, idmKind});
        handleShow();
    };

    handleUpdateAclClose = () => {
        const {handleClose, cancelUpdateAcl, idmKind} = this.props;
        handleClose();
        cancelUpdateAcl({idmKind});
    };

    onAdd = (form) => {
        const {path, idmKind, updateAcl, version} = this.props;
        const {auditors, readApprovers, responsible, ...rest} = form.getState().values;
        return updateAcl({
            path,
            idmKind,
            values: {
                ...rest,
                responsibleApproval: roleListValueToSubjectList(responsible),
                auditors: roleListValueToSubjectList(auditors),
                readApprovers: roleListValueToSubjectList(readApprovers),
            },
            version,
        });
    };

    renderDialog() {
        const {
            idmKind,
            visible,
            bossApproval,
            inheritAcl,
            disableInheritanceResponsible,
            auditors,
            responsible,
            readApprovers,
            manageAclError,
        } = this.props;

        const {
            allowReadApprovers,
            allowBossApprovals,
            allowAuditors,
            allowInheritAcl,
            allowInheritResponsibles,
        } = PERMISSIONS_SETTINGS[idmKind];

        return (
            <Dialog
                pristineSubmittable
                modal={false}
                visible={visible}
                confirmText="Save"
                onClose={this.handleUpdateAclClose}
                onAdd={this.onAdd}
                initialValues={{
                    auditors: prepareRoleListValue(auditors),
                    readApprovers: prepareRoleListValue(readApprovers),
                    responsible: prepareRoleListValue(responsible),

                    inheritanceResponsible: !disableInheritanceResponsible,
                    inheritAcl: Boolean(inheritAcl),
                    bossApproval: Boolean(bossApproval),
                }}
                formExtras={{initialValuesEqual: _isEqual}}
                fields={[
                    {
                        name: 'responsible',
                        type: 'acl-roles',
                        caption: 'Responsible',
                        extras: {
                            placeholder: 'Who should approve...',
                        },
                    },
                    allowInheritResponsibles && {
                        name: 'inheritanceResponsible',
                        type: 'tumbler',
                        caption: 'Inherit responsible',
                    },
                    allowReadApprovers && {
                        name: 'readApprovers',
                        type: 'acl-roles',
                        caption: 'Read approvers',
                        extras: {
                            placeholder: 'Who should approve read requests...',
                        },
                    },
                    allowAuditors && {
                        name: 'auditors',
                        type: 'acl-roles',
                        caption: 'Auditors',
                        extras: {
                            placeholder: 'Who should audit ACL change...',
                        },
                    },
                    allowBossApprovals && {
                        name: 'bossApproval',
                        type: 'tumbler',
                        caption: 'Boss approval',
                    },
                    allowInheritAcl && {
                        name: 'inheritAcl',
                        type: 'tumbler',
                        caption: 'Inherit ACL',
                    },
                    {
                        name: 'comment',
                        caption: 'Comment for IDM',
                        type: 'textarea',
                    },
                    {
                        name: 'error-block',
                        type: 'block',
                        extras: {
                            children: manageAclError && (
                                <Error message="Acl update failure" error={manageAclError} />
                            ),
                        },
                    },
                ].filter(Boolean)}
            />
        );
    }

    renderForm() {
        const {loading, error, errorData} = this.props;

        return (
            <LoadDataHandler loaded={false} error={error} errorData={errorData}>
                {loading ? <Loader /> : this.renderDialog()}
            </LoadDataHandler>
        );
    }

    render() {
        const {visible, handleClose, className, loading, error} = this.props;

        return (
            <ErrorBoundary>
                <div className={block(null, className)}>
                    <Button onClick={this.handleModalOpen}>Manage ACL</Button>

                    <CommonDialog
                        size="m"
                        open={visible}
                        autoclosable={false}
                        onClose={handleClose}
                        className={block('modal', {loading, error})}
                    >
                        <CommonDialog.Header caption="Manage ACL" />
                        <CommonDialog.Body>{this.renderForm()}</CommonDialog.Body>
                    </CommonDialog>
                </div>
            </ErrorBoundary>
        );
    }
}

export default compose(withVisible)(ManageAcl);
