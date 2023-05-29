import React, {useCallback, useMemo} from 'react';
import {compose} from 'redux';
import cn from 'bem-cn-lite';

import _isEqual from 'lodash/isEqual';

import Dialog, {FormApi} from '../../../components/Dialog/Dialog';
import {Dialog as CommonDialog, Loader} from '@gravity-ui/uikit';

import RoleListControl, {
    prepareRoleListValue,
    roleListValueToSubjectList,
} from '../../../components/Dialog/controls/RoleListControl/RoleListControl';

import {RoleConverted} from '../../../utils/acl/acl-types';
import {PreparedRole} from '../../../utils/acl';
import {YTError} from '../../../types';

import LoadDataHandler from '../../../components/LoadDataHandler/LoadDataHandler';
import Error from '../../../components/Error/Error';
import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import Button from '../../../components/Button/Button';

import withVisible, {WithVisibleProps} from '../../../hocs/withVisible';

import {PERMISSIONS_SETTINGS} from '../../../constants/acl';

import './ManageAcl.scss';

const block = cn('acl-manage');

const manageAclDialogFields = [
    {
        name: 'responsible',
        type: 'acl-roles',
        caption: 'Responsible',
        extras: {
            maxVisibleCount: 3,
            placeholder: 'Who should approve...',
        },
    },
    {
        name: 'inheritanceResponsible',
        type: 'tumbler',
        caption: 'Inherit responsible',
    },
    {
        name: 'readApprovers',
        type: 'acl-roles',
        caption: 'Read approvers',
        extras: {
            maxVisibleCount: 3,
            placeholder: 'Who should approve read requests...',
        },
    },
    {
        name: 'auditors',
        type: 'acl-roles',
        caption: 'Auditors',
        extras: {
            maxVisibleCount: 3,
            placeholder: 'Who should audit ACL change...',
        },
    },
    {
        name: 'bossApproval',
        type: 'tumbler',
        caption: 'Boss approval',
    },
    {
        name: 'inheritAcl',
        type: 'tumbler',
        caption: 'Inherit ACL',
    },
    {
        name: 'comment',
        caption: 'Comment for IDM',
        type: 'textarea',
    },
] as const;

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
    loadAclData: (args: {path: string; idmKind: string}) => void;
    updateAcl: (args: unknown) => Promise<void>;
    cancelUpdateAcl: (args: {idmKind: string}) => void;
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
        },
        [idmKind, path, updateAcl, version],
    );

    const dialogFields = useMemo(() => {
        const idmKindConditions: Record<string, boolean> = {
            inheritAcl: PERMISSIONS_SETTINGS[idmKind].allowInheritAcl,
            bossApproval: PERMISSIONS_SETTINGS[idmKind].allowBossApprovals,
            auditors: PERMISSIONS_SETTINGS[idmKind].allowAuditors,
            readApprovers: PERMISSIONS_SETTINGS[idmKind].allowReadApprovers,
            inheritanceResponsible: PERMISSIONS_SETTINGS[idmKind].allowInheritResponsibles,
        };
        return manageAclDialogFields.filter(({name}) =>
            idmKindConditions[name] !== undefined ? idmKindConditions[name] : true,
        );
    }, [idmKind]);

    const renderDialog = () => {
        return (
            <Dialog<FormValues>
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
