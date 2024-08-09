import React, {useCallback, useMemo, useState} from 'react';
import {compose} from 'redux';
import cn from 'bem-cn-lite';

import {Dialog as CommonDialog, Loader} from '@gravity-ui/uikit';

import _isEqual from 'lodash/isEqual';

import {DialogField, FormApi, YTDFDialog} from '../../../components/Dialog/Dialog';

import {IdmKindType} from '../../../utils/acl/acl-types';
import {PreparedRole} from '../../../utils/acl';
import {YTError} from '../../../types';

import Button from '../../../components/Button/Button';
import Error from '../../../components/Error/Error';
import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import LoadDataHandler from '../../../components/LoadDataHandler/LoadDataHandler';

import withVisible, {WithVisibleProps} from '../../../hocs/withVisible';

import './ManageInheritance.scss';
import UIFactory from '../../../UIFactory';
import ErrorBlock from '../../../components/Block/Block';
import {ACLReduxProps} from '../ACL-connect-helpers';
import {ManageInheritanceFieldNames} from '../ManageAcl/ManageAcl';

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
            const {...rest} = form.getState().values;

            return updateAcl({
                path,
                idmKind,
                values: {
                    ...rest,
                },
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
            }) as Record<ManageInheritanceFieldNames, DialogField<FormValues>>,
        [hasWarning],
    );

    const {manageInheritanceFields, buttonsTitle} = UIFactory.getAclApi();
    const dialogFields = useMemo(() => {
        const permissionsSettings = UIFactory.getAclPermissionsSettings();
        const idmKindConditions: {[Key in ManageInheritanceFieldNames]?: boolean} = {
            inheritAcl: permissionsSettings[idmKind].allowInheritAcl,
        };

        return manageInheritanceFields
            .filter((name) =>
                idmKindConditions[name] !== undefined ? idmKindConditions[name] : true,
            )
            .map((name) => manageAclDialogFields[name]);
    }, [idmKind, manageAclDialogFields, manageInheritanceFields]);

    const renderDialog = () => {
        return (
            <YTDFDialog<FormValues>
                pristineSubmittable
                modal={false}
                visible={Boolean(visible)}
                onClose={handleUpdateAclClose}
                onAdd={onAdd}
                initialValues={{
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

    const {editInheritance = 'Edit inheritance'} = buttonsTitle ?? {};

    return (
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
