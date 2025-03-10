import React, {useCallback, useMemo} from 'react';
import {compose} from 'redux';
import cn from 'bem-cn-lite';

import isEqual_ from 'lodash/isEqual';

import {Loader} from '@gravity-ui/uikit';
import {DialogWrapper as CommonDialog} from '../../../components/DialogWrapper/DialogWrapper';

import {
    DialogField,
    FormApi,
    RoleListControlProps,
    YTDFDialog,
    prepareRoleListValue,
    roleListValueToSubjectList,
} from '../../../components/Dialog';

import {IdmKindType} from '../../../utils/acl/acl-types';
import {PreparedRole} from '../../../utils/acl';
import {YTError} from '../../../types';

import LoadDataHandler from '../../../components/LoadDataHandler/LoadDataHandler';
import {YTErrorBlock} from '../../../components/Error/Error';
import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import Button from '../../../components/Button/Button';

import withVisible, {WithVisibleProps} from '../../../hocs/withVisible';

import UIFactory from '../../../UIFactory';
import {ACLReduxProps} from '../ACL-connect-helpers';

import './ManageAcl.scss';

const block = cn('acl-manage');

export type ManageAclFieldsNames =
    | 'responsible'
    | 'inheritanceResponsible'
    | 'readApprovers'
    | 'auditors'
    | 'bossApproval'
    | 'inheritAcl'
    | 'comment';

export type ManageInheritanceFieldNames = 'inheritAcl' | 'inheritAcl_warning' | 'comment';

interface Props extends WithVisibleProps {
    className?: string;
    path: string;
    idmKind: IdmKindType;
    version?: string;
    normalizedPoolTree?: string;
    loading: boolean;
    auditors: Array<PreparedRole>;
    responsible: Array<PreparedRole>;
    readApprovers: Array<PreparedRole>;
    disableInheritanceResponsible?: boolean | PreparedRole;
    bossApproval?: PreparedRole;
    error: boolean;
    manageAclError?: YTError;
    errorData?: YTError;
    loadAclData: (args: {path: string; idmKind: IdmKindType}) => void;
    updateAcl: (...args: Parameters<ACLReduxProps['userPermissionsUpdateAcl']>) => Promise<void>;
    cancelUpdateAcl: (args: {idmKind: IdmKindType}) => void;
}

interface FormValues {
    auditors: RoleListControlProps['value'];
    responsible: RoleListControlProps['value'];
    readApprovers: RoleListControlProps['value'];
    inheritanceResponsible: boolean;
    bossApproval: boolean;
    comment?: string;
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
    } = props;

    const handleModalOpen = useCallback(() => {
        loadAclData({path, idmKind});
        handleShow();
    }, [handleShow, idmKind, loadAclData, path]);

    const handleUpdateAclClose = useCallback(() => {
        handleClose();
        cancelUpdateAcl({idmKind});
    }, [cancelUpdateAcl, handleClose, idmKind]);

    const onAdd = useCallback(
        (form: FormApi<FormValues, Partial<FormValues>>) => {
            const {auditors, readApprovers, responsible, inheritanceResponsible, ...rest} =
                form.getState().values;

            return updateAcl({
                path,
                idmKind,
                values: {
                    ...rest,
                    disableInheritance: !inheritanceResponsible,
                    responsible: roleListValueToSubjectList(responsible),
                    auditors: roleListValueToSubjectList(auditors),
                    readApprovers: roleListValueToSubjectList(readApprovers),
                },
                version,
                mode: 'keep-missing-fields',
            });
        },
        [idmKind, path, updateAcl, version],
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
                comment: {
                    name: 'comment',
                    caption: 'Comment for IDM',
                    type: 'textarea',
                },
            }) as Record<ManageAclFieldsNames, DialogField<FormValues>>,
        [],
    );

    const {manageAclFields} = UIFactory.getAclApi();
    const dialogFields = useMemo(() => {
        const permissionsSettings = UIFactory.getAclPermissionsSettings();
        const idmKindConditions: {[Key in ManageAclFieldsNames]?: boolean} = {
            bossApproval: permissionsSettings[idmKind].allowBossApprovals,
            auditors: permissionsSettings[idmKind].allowAuditors,
            readApprovers: permissionsSettings[idmKind].allowReadApprovers,
            inheritanceResponsible: permissionsSettings[idmKind].allowInheritResponsibles,
        };

        return manageAclFields
            .filter((name) =>
                idmKindConditions[name] !== undefined ? idmKindConditions[name] : true,
            )
            .map((name) => manageAclDialogFields[name]);
    }, [idmKind, manageAclDialogFields, manageAclFields]);

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
                }}
                formExtras={{initialValuesEqual: isEqual_}}
                fields={[
                    ...dialogFields,
                    {
                        name: 'error-block',
                        type: 'block',
                        extras: {
                            children: manageAclError && (
                                <YTErrorBlock message="Acl update failure" error={manageAclError} />
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

    return !manageAclFields?.length ? null : (
        <ErrorBoundary>
            <div className={block(null, className)}>
                <Button onClick={handleModalOpen}>Manage responsibles</Button>

                <CommonDialog
                    size="m"
                    open={Boolean(visible)}
                    onClose={handleClose}
                    className={block('modal', {loading, error})}
                >
                    <CommonDialog.Header caption="Manage responsibles" />
                    <CommonDialog.Body>{renderForm()}</CommonDialog.Body>
                </CommonDialog>
            </div>
        </ErrorBoundary>
    );
}

export default compose(withVisible)(ManageAcl) as unknown as React.ComponentType<
    Omit<Props, keyof WithVisibleProps>
>;
