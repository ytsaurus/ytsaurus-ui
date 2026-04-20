import React, {useCallback, useMemo, useState} from 'react';
import {compose} from 'redux';
import cn from 'bem-cn-lite';

import {Loader} from '@gravity-ui/uikit';
import {DialogWrapper as CommonDialog} from '../../../components/DialogWrapper/DialogWrapper';

import isEqual_ from 'lodash/isEqual';

import {type DialogField, type FormApi, YTDFDialog} from '../../../components/Dialog';

import {type IdmKindType} from '../../../utils/acl/acl-types';
import {type PreparedRole} from '../../../utils/acl';
import {type YTError} from '../../../types';

import Button from '../../../components/Button/Button';
import {YTErrorBlock} from '../../../components/Error/Error';
import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import LoadDataHandler from '../../../components/LoadDataHandler/LoadDataHandler';

import withVisible, {type WithVisibleProps} from '../../../hocs/withVisible';

import './ManageInheritance.scss';
import UIFactory from '../../../UIFactory';
import {type ACLReduxProps} from '../ACL-connect-helpers';
import {type ManageInheritanceFieldNames} from '../ManageAcl/ManageAcl';
import i18n from './i18n';

const block = cn('acl-inheritance');

interface Props extends WithVisibleProps {
    className?: string;
    path: string;
    idmKind: IdmKindType;
    version?: string;
    normalizedPoolTree?: string;
    loading: boolean;
    inheritAcl?: boolean | PreparedRole;
    error: boolean;
    manageAclError?: YTError;
    errorData?: YTError;
    loadAclData: (args: {path: string; idmKind: IdmKindType}) => void;
    updateAcl: (...args: Parameters<ACLReduxProps['userPermissionsUpdateAcl']>) => Promise<void>;
    cancelUpdateAcl: (args: {idmKind: IdmKindType}) => void;
}

interface FormValues {
    inheritAcl: boolean;
    comment?: string;
}

function ManageInheritance(props: Props) {
    const {
        className,
        path,
        idmKind,
        version,
        visible,
        loading,
        handleShow,
        handleClose,
        inheritAcl,
        manageAclError,
        loadAclData,
        cancelUpdateAcl,
        updateAcl,
        error,
        errorData,
    } = props;

    const [hasWarning, setHasWarning] = useState(false);

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
            const {values} = form.getState();

            return updateAcl({
                path,
                idmKind,
                values,
                version,
            });
        },
        [idmKind, path, updateAcl, version],
    );

    const manageAclDialogFields = useMemo(
        () =>
            ({
                inheritAcl: {
                    name: 'inheritAcl',
                    type: 'tumbler',
                    caption: i18n('field_inherit-acl'),
                    onChange: (value) => {
                        setHasWarning(!value);
                    },
                },
                inheritAcl_warning: {
                    name: 'inheritAcl_warning',
                    type: 'block',
                    extras: {
                        children: hasWarning ? (
                            <YTErrorBlock
                                type={'alert'}
                                message={i18n('alert_inherit-acl-warning')}
                            />
                        ) : null,
                    },
                },
                comment: {
                    name: 'comment',
                    caption: i18n('field_comment-for-idm'),
                    type: 'textarea',
                },
            }) as Record<ManageInheritanceFieldNames, DialogField<FormValues>>,
        [hasWarning],
    );

    const {manageInheritanceFields, buttonsTitle} = UIFactory.getAclApi();
    const dialogFields = useMemo(() => {
        const permissionsSettings = UIFactory.getAclPermissionsSettings();
        const {allowInheritAcl} = permissionsSettings[idmKind];
        return allowInheritAcl
            ? manageInheritanceFields.map((name) => manageAclDialogFields[name])
            : [];
    }, [idmKind, manageAclDialogFields, manageInheritanceFields]);

    const renderDialog = () => {
        return (
            <YTDFDialog<FormValues>
                modal={false}
                visible={Boolean(visible)}
                onClose={handleUpdateAclClose}
                onAdd={onAdd}
                initialValues={{
                    inheritAcl: Boolean(inheritAcl),
                }}
                formExtras={{initialValuesEqual: isEqual_}}
                fields={[
                    ...dialogFields,
                    {
                        name: 'error-block',
                        type: 'block',
                        extras: {
                            children: manageAclError && (
                                <YTErrorBlock
                                    message={i18n('alert_acl-update-failure')}
                                    error={manageAclError}
                                />
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

    const {editInheritance = i18n('action_edit-inheritance')} = buttonsTitle ?? {};

    return !dialogFields.length ? null : (
        <ErrorBoundary>
            <div className={block(null, className)}>
                <Button onClick={handleModalOpen}>{editInheritance}</Button>

                <CommonDialog
                    size="m"
                    open={Boolean(visible)}
                    onClose={handleClose}
                    className={block('modal', {loading, error})}
                >
                    <CommonDialog.Header caption={editInheritance} />
                    <CommonDialog.Body>{renderForm()}</CommonDialog.Body>
                </CommonDialog>
            </div>
        </ErrorBoundary>
    );
}

export default compose(withVisible)(ManageInheritance) as unknown as React.ComponentType<
    Omit<Props, keyof WithVisibleProps>
>;
