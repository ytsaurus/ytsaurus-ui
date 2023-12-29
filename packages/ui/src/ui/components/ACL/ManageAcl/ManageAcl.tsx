import React, {useCallback, useMemo, useState} from 'react';
import {compose} from 'redux';
import cn from 'bem-cn-lite';

import _isEqual from 'lodash/isEqual';

import {DialogField, FormApi, YTDFDialog} from '../../../components/Dialog/Dialog';
import {Dialog as CommonDialog, Loader} from '@gravity-ui/uikit';

import RoleListControl, {
    prepareRoleListValue,
    roleListValueToSubjectList,
} from '../../../components/Dialog/controls/RoleListControl/RoleListControl';

import {ACLType, RoleConverted} from '../../../utils/acl/acl-types';
import {PreparedRole} from '../../../utils/acl';
import {YTError} from '../../../types';

import LoadDataHandler from '../../../components/LoadDataHandler/LoadDataHandler';
import Error from '../../../components/Error/Error';
import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import Button from '../../../components/Button/Button';

import withVisible, {WithVisibleProps} from '../../../hocs/withVisible';

import './ManageAcl.scss';
import UIFactory from '../../../UIFactory';
import ErrorBlock from '../../Block/Block';

const block = cn('acl-manage');

export type ManageAclFieldsNames =
    | 'responsible'
    | 'inheritanceResponsible'
    | 'readApprovers'
    | 'auditors'
    | 'bossApproval'
    | 'inheritAcl'
    | 'inheritAcl_warning'
    | 'comment';

interface Props extends WithVisibleProps {
    className?: string;
    path: string;
    idmKind: string;
    version: string;
    normalizedPoolTree?: string;
    loading: boolean;
    auditors: Array<RoleConverted>;
    responsible: Array<RoleConverted>;
    readApprovers: Array<RoleConverted>;
    disableInheritanceResponsible?: PreparedRole;
    bossApproval?: PreparedRole;
    inheritAcl: boolean;
    error: boolean;
    manageAclError: YTError;
    errorData?: YTError;
    loadAclData: (args: {path: string; idmKind: string; aclType: ACLType}) => void;
    updateAcl: (args: unknown) => Promise<void>;
    cancelUpdateAcl: (args: {idmKind: string}) => void;
    aclType: ACLType;
}

interface FormValues {
    auditors: RoleListControl['props']['value'];
    responsible: RoleListControl['props']['value'];
    readApprovers: RoleListControl['props']['value'];
    inheritanceResponsible: boolean;
    bossApproval: boolean;
    inheritAcl: boolean;
}

function ManageAcl(props: Props) {
    const {
        className,
        path,
        idmKind,
        version,
        visible,
        loading,
        handleShow,
        handleClose,
        bossApproval,
        inheritAcl,
        disableInheritanceResponsible,
        auditors,
        responsible,
        readApprovers,
        manageAclError,
        error,
        errorData,
        loadAclData,
        cancelUpdateAcl,
        updateAcl,
        aclType,
    } = props;

    const [hasWarning, setHasWarning] = useState(false);

    const handleModalOpen = useCallback(() => {
        loadAclData({path, idmKind, aclType});
        handleShow();
    }, [handleShow, idmKind, loadAclData, path]);

    const handleUpdateAclClose = useCallback(() => {
        handleClose();
        cancelUpdateAcl({idmKind});
    }, [cancelUpdateAcl, handleClose, idmKind]);

    const onAdd = useCallback(
        (form: FormApi<FormValues, Partial<FormValues>>) => {
            const {auditors, readApprovers, responsible, ...rest} = form.getState().values;

            return updateAcl({
                path,
                idmKind,
                aclType,
                values: {
                    ...rest,
                    responsibleApproval: roleListValueToSubjectList(responsible),
                    auditors: roleListValueToSubjectList(auditors),
                    readApprovers: roleListValueToSubjectList(readApprovers),
                },
                version,
            });
        },
        [idmKind, path, updateAcl, version, aclType],
    );

    const manageAclDialogFields = useMemo(
        () =>
            ({
                responsible: {
                    name: 'responsible',
                    type: 'acl-roles',
                    caption: 'Responsible',
                    extras: {
                        maxVisibleCount: 3,
                        placeholder: 'Who should approve...',
                    },
                },
                inheritanceResponsible: {
                    name: 'inheritanceResponsible',
                    type: 'tumbler',
                    caption: 'Inherit responsible',
                },
                readApprovers: {
                    name: 'readApprovers',
                    type: 'acl-roles',
                    caption: 'Read approvers',
                    extras: {
                        maxVisibleCount: 3,
                        placeholder: 'Who should approve read requests...',
                    },
                },
                auditors: {
                    name: 'auditors',
                    type: 'acl-roles',
                    caption: 'Auditors',
                    extras: {
                        maxVisibleCount: 3,
                        placeholder: 'Who should audit ACL change...',
                    },
                },
                bossApproval: {
                    name: 'bossApproval',
                    type: 'tumbler',
                    caption: 'Boss approval',
                },
                inheritAcl: {
                    name: 'inheritAcl',
                    type: 'tumbler',
                    caption: 'Inherit ACL',
                    onChange: (value) => {
                        setHasWarning(!value);
                    },
                },
                inheritAcl_warning: {
                    name: 'inheritAcl_warning',
                    type: 'block',
                    extras: {
                        children: hasWarning ? (
                            <ErrorBlock
                                type={'alert'}
                                message={
                                    <>
                                        Setting <span className={block('flag')}>inherit_acl</span>{' '}
                                        flag to <span className={block('flag')}>false</span> may
                                        result in the loss of permissions sufficient to undo this
                                        operation.{' '}
                                    </>
                                }
                            ></ErrorBlock>
                        ) : null,
                    },
                },
                comment: {
                    name: 'comment',
                    caption: 'Comment for IDM',
                    type: 'textarea',
                },
            } as Record<ManageAclFieldsNames, DialogField<FormValues>>),
        [hasWarning],
    );

    const dialogFields = useMemo(() => {
        const permissionsSettings = UIFactory.getAclPermissionsSettings();
        const idmKindConditions: {[Key in ManageAclFieldsNames]?: boolean} = {
            inheritAcl: permissionsSettings[idmKind].allowInheritAcl,
            bossApproval: permissionsSettings[idmKind].allowBossApprovals,
            auditors: permissionsSettings[idmKind].allowAuditors,
            readApprovers: permissionsSettings[idmKind].allowReadApprovers,
            inheritanceResponsible: permissionsSettings[idmKind].allowInheritResponsibles,
        };

        return UIFactory.getAclApi()
            .manageAclFields.filter((name) =>
                idmKindConditions[name] !== undefined ? idmKindConditions[name] : true,
            )
            .map((name) => manageAclDialogFields[name]);
    }, [idmKind, manageAclDialogFields]);

    const renderDialog = () => {
        return (
            <YTDFDialog<FormValues>
                pristineSubmittable
                modal={false}
                visible={Boolean(visible)}
                onClose={handleUpdateAclClose}
                onAdd={onAdd}
                initialValues={{
                    responsible: prepareRoleListValue(responsible),
                    inheritanceResponsible: !disableInheritanceResponsible,
                    readApprovers: prepareRoleListValue(readApprovers),
                    auditors: prepareRoleListValue(auditors),
                    bossApproval: Boolean(bossApproval),
                    inheritAcl: Boolean(inheritAcl),
                }}
                formExtras={{initialValuesEqual: _isEqual}}
                fields={[
                    ...dialogFields,
                    {
                        name: 'error-block',
                        type: 'block',
                        extras: {
                            children: manageAclError && (
                                <Error message="Acl update failure" error={manageAclError} />
                            ),
                        },
                    },
                ]}
            />
        );
    };

    const renderForm = () => {
        return (
            <LoadDataHandler loaded={false} error={error} errorData={errorData}>
                {loading ? <Loader /> : renderDialog()}
            </LoadDataHandler>
        );
    };

    return (
        <ErrorBoundary>
            <div className={block(null, className)}>
                <Button onClick={handleModalOpen}>Manage ACL</Button>

                <CommonDialog
                    size="m"
                    open={Boolean(visible)}
                    onClose={handleClose}
                    className={block('modal', {loading, error})}
                >
                    <CommonDialog.Header caption="Manage ACL" />
                    <CommonDialog.Body>{renderForm()}</CommonDialog.Body>
                </CommonDialog>
            </div>
        </ErrorBoundary>
    );
}

export default compose(withVisible)(ManageAcl);
