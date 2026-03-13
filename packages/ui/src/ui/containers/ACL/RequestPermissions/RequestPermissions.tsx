import {compose} from 'redux';
import cn from 'bem-cn-lite';
import React, {useCallback, useMemo} from 'react';
import {DialogField, FormApi, YTDFDialog, makeErrorFields} from '../../../components/Dialog';
import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import {Button, ButtonProps} from '@gravity-ui/uikit';
import PermissionsControl from '../RequestPermissions/PermissionsControl/PermissionsControl';

import withVisible, {WithVisibleProps} from '../../../hocs/withVisible';

import './RequestPermissions.scss';
import {YTError} from '../../../types';
import {AclMode, INHERITANCE_MODE_TYPES, IdmObjectType} from '../../../constants/acl';

import UIFactory from '../../../UIFactory';
import hammer from '../../../common/hammer';
import map_ from 'lodash/map';

import {docsUrl} from '../../../config';
import {makeLink} from '../../../utils/utils';
import {AclColumnGroup, IdmKindType, InheritanceModeType} from '../../../utils/acl/acl-types';
import {YTPermissionTypeUI} from '../../../utils/acl/acl-api';
import {PermissionToRequest} from '../../../store/actions/acl';
import {useAvailablePermissions} from '../hooks/use-available-permissions';
import i18n from './i18n';
import i18nPermissionValues from '../i18n-permission-values';

const block = cn('acl-request-permissions');

const FLAG_NAME_PREFIX = '##_flag_';

export type RequestPermissionsFieldsNames =
    | 'cluster'
    | 'path'
    | 'permissions'
    | 'subjects'
    | 'duration'
    | 'commentHeader'
    | 'comment'
    | 'inheritance_mode'
    | 'permissionFlags'
    | 'readColumns'
    | 'readColumnGroup';

export interface Props extends WithVisibleProps {
    className?: string;
    buttonClassName?: string;
    buttonProps?: ButtonProps;
    cluster?: string;
    normalizedPoolTree?: string;
    path: string;
    idmKind: IdmKindType;
    requestPermissions: (params: {
        values: PermissionToRequest;
        idmKind: IdmKindType;
    }) => Promise<void>;
    cancelRequestPermissions: (params: {idmKind: IdmKindType}) => unknown;
    error?: YTError;
    onSuccess?: () => void;
    columnGroups?: Array<AclColumnGroup>;
    aclMode?: AclMode;
}

type FormValues = {
    path: string;
    cluster: string;
    permissions: {[x: string]: Array<YTPermissionTypeUI>} | null;
    subjects: Array<{
        value: string;
        type: 'users' | 'groups' | 'app';
        text?: string;
    }>;
    inheritance_mode?: InheritanceModeType;
    duration?: Date;
    comment?: string;
    readColumnGroup?: string;
} & Record<`${typeof FLAG_NAME_PREFIX}${string}`, boolean>;

const SHORT_TITLE: Partial<Record<IdmKindType, string>> = {
    access_control_object: 'ACO',
};

const COLUMNS_FELDS = new Set<RequestPermissionsFieldsNames>(['readColumns', 'readColumnGroup']);

function RequestPermissions(props: Props) {
    const {
        aclMode,
        visible,
        handleShow,
        handleClose,
        className,
        buttonClassName,
        path,
        idmKind,
        requestPermissions,
        cancelRequestPermissions,
        error,
        cluster,
        columnGroups,
        buttonProps,
        /*denyColumns,*/
    } = props;

    const onClose = useCallback(() => {
        handleClose();
        cancelRequestPermissions({idmKind});
    }, [handleClose, cancelRequestPermissions, idmKind]);

    const {
        requestPermissionsFields,
        requestPermissionsFlags = {},
        buttonsTitle,
    } = UIFactory.getAclApi();

    const onAdd = useCallback(
        (form: FormApi<FormValues, Partial<FormValues>>) => {
            const values = {...form.getState().values};
            const permissionFlags: Record<string, boolean> = {};
            Object.keys(requestPermissionsFlags).forEach((k) => {
                const key = `${FLAG_NAME_PREFIX}${k}` as keyof typeof values;
                permissionFlags[k] = Boolean(values[key]);

                delete values[key];
            });
            return requestPermissions({
                values: {...values, permissionFlags},
                idmKind,
            });
        },
        [requestPermissions, idmKind],
    );

    const currentCaption = `${i18n('field_current')} ${SHORT_TITLE[idmKind] ?? idmKind}`;

    const {permissionsToRequest: choices} = useAvailablePermissions({idmKind, path});

    const firstItemDisabled = idmKind === IdmObjectType.ACCOUNT;

    const permissions = firstItemDisabled ? valueWithCheckedFirstChoice(choices) : null;

    const availableFields: Record<
        RequestPermissionsFieldsNames,
        Omit<DialogField, 'name'>
    > = useMemo(() => {
        const disabledChoices = idmKind === IdmObjectType.ACCOUNT ? [0] : undefined;
        return {
            cluster: {
                type: 'plain',
                caption: i18n('field_cluster'),
                extras: {
                    className: block('cluster'),
                },
            },
            path: {
                type: 'text',
                caption: currentCaption,
                extras: {
                    disabled: !error,
                },
            },
            permissions: {
                type: 'permissions',
                caption: i18n('field_permissions'),
                required: true,
                tooltip: (
                    <>
                        {docsUrl(
                            makeLink(
                                UIFactory.docsUrls['acl:permissions'],
                                i18n('tooltip_permissions-types'),
                            ),
                            i18n('tooltip_permissions-types'),
                        )}
                    </>
                ),
                extras: {
                    choices: choices,
                    disabledChoices,
                },
            },
            readColumns: {
                type: 'acl-columns',
                caption: i18n('field_read-columns'),
                required: true,
            },
            readColumnGroup: {
                type: 'acl-column-group',
                caption: i18n('field_read-column-group'),
                required: true,
                extras: {
                    columnGroups,
                },
            },
            subjects: {
                type: 'acl-subjects',
                caption: i18n('field_subjects'),
                required: true,
                extras: {
                    placeholder: i18n('placeholder_enter-group-user'),
                    allowedTypes: ['users', 'groups', 'app'],
                },
            },
            duration: {
                type: 'before-date',
                caption: i18n('field_duration'),
            },
            commentHeader: {
                type: 'block',
                className: block('modal-comments-header'),
                extras: {
                    children: (
                        <React.Fragment>
                            <div className={'is-dialog__label'}>{i18n('field_comment')}</div>
                            <div className={block('comment-notice')}>
                                {i18n('alert_teams-people-request')}
                            </div>
                        </React.Fragment>
                    ),
                },
            },
            comment: {
                type: 'textarea',
                className: block('modal-comments'),
            },
            inheritance_mode: {
                type: 'yt-select-single',
                caption: i18n('field_inheritance-mode'),
                extras: {
                    items: map_(INHERITANCE_MODE_TYPES, (value) => ({
                        value: value,
                        text: i18nPermissionValues(`inheritance_${value}`),
                    })),
                    hideClear: true,
                    hideFilter: true,
                    with: 'max',
                },
            },
            permissionFlags: {
                type: 'block',
                caption: i18n('field_permission-flags'),
                extras: {children: i18n('value_not-implemented')},
            },
        };
    }, [choices, currentCaption, error, idmKind]);

    const useColumns = aclMode === AclMode.COLUMN_GROUPS_PERMISSISONS;

    const dialogFields = useMemo(() => {
        let flagsIndex = -1;
        const res = requestPermissionsFields.reduce(
            (acc, field) => {
                const allowField = useColumns ? field !== 'permissions' : !COLUMNS_FELDS.has(field);
                if (!allowField) {
                    return acc;
                }

                if (field === 'permissionFlags') {
                    flagsIndex = acc.length;
                }

                acc.push({
                    ...availableFields[field],
                    name: field,
                } as DialogField<FormValues>);

                return acc;
            },
            [] as Array<DialogField<FormValues>>,
        );

        if (flagsIndex !== -1) {
            const flags: typeof res = Object.keys(requestPermissionsFlags ?? []).map((key) => {
                const flagInfo = requestPermissionsFlags[key];
                return {
                    type: 'tumbler',
                    caption: hammer.format.ReadableField(flagInfo?.title),
                    name: `${FLAG_NAME_PREFIX}${key}`,
                    tooltip: flagInfo.help,
                    initialValue: flagInfo.initialValue,
                };
            });
            res.splice(flagsIndex, 1, ...flags);
        }
        return res;
    }, [availableFields, requestPermissionsFields, useColumns]);

    const {editAcl = 'Add ACL', editColumnsAcl = 'Edit columns ACL'} = buttonsTitle ?? {};
    const title = useColumns ? editColumnsAcl : editAcl;

    return !choices?.length ? null : (
        <ErrorBoundary>
            <div className={block(null, className)}>
                <Button
                    className={buttonClassName}
                    view="action"
                    {...buttonProps}
                    onClick={handleShow}
                >
                    {title}
                </Button>

                <YTDFDialog<FormValues>
                    pristineSubmittable
                    onClose={onClose}
                    className={block('modal')}
                    visible={Boolean(visible)}
                    onAdd={onAdd}
                    headerProps={{
                        title,
                    }}
                    initialValues={{
                        path,
                        permissions,
                        cluster,
                        inheritance_mode: INHERITANCE_MODE_TYPES.OBJECT_AND_DESCENDANTS,
                    }}
                    validate={(values) => {
                        const subjects = values.subjects;
                        const validationError: Record<
                            keyof Pick<FormValues, 'subjects'>,
                            string | undefined
                        > = {
                            subjects: undefined,
                        };

                        if (!subjects.length) {
                            const errorMessage = 'At least one subject should be selected.';
                            validationError.subjects = errorMessage;
                        }

                        return validationError;
                    }}
                    fields={[...dialogFields, ...makeErrorFields([error])]}
                />
            </div>
        </ErrorBoundary>
    );
}

export default compose(withVisible)(RequestPermissions) as unknown as React.ComponentType<
    Omit<Props, keyof WithVisibleProps>
>;

function valueWithCheckedFirstChoice(choices: string | any[]) {
    if (!choices || choices.length < 1) {
        return {};
    }

    return {
        [PermissionsControl.getChoiceName(choices[0])]: choices[0],
    };
}
