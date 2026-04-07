import {Button, ButtonProps} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React, {useCallback, useMemo} from 'react';
import {compose} from 'redux';
import {DialogField, FormApi, YTDFDialog, makeErrorFields} from '../../../components/Dialog';
import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import PermissionsControl from '../RequestPermissions/PermissionsControl/PermissionsControl';

import withVisible, {WithVisibleProps} from '../../../hocs/withVisible';

import {AclMode, INHERITANCE_MODE_TYPES, IdmObjectType} from '../../../constants/acl';
import {YTError} from '../../../types';
import './RequestPermissions.scss';

import map_ from 'lodash/map';
import UIFactory from '../../../UIFactory';
import hammer from '../../../common/hammer';
import i18n from './i18n';

import HelpLink from '../../../components/HelpLink/HelpLink';
import {docsUrl} from '../../../config';
import {PermissionToRequest} from '../../../store/actions/acl';
import {YTPermissionTypeUI} from '../../../utils/acl/acl-api';
import {AclColumnGroup, AclRowGroup, IdmKindType} from '../../../utils/acl/acl-types';
import {makeLink} from '../../../utils/utils';
import {useAvailablePermissions} from '../hooks/use-available-permissions';

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
    | 'readColumnGroup'
    | 'readRowGroup'
    | 'read_row_access_predicate';

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
    rowGroups?: Array<AclRowGroup>;
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
    inheritance_mode?: string;
    duration?: Date;
    comment?: string;
    readColumnGroup?: string;
    readRowGroup?: string;
} & Record<`${typeof FLAG_NAME_PREFIX}${string}`, boolean>;

const SHORT_TITLE: Partial<Record<IdmKindType, string>> = {
    access_control_object: 'ACO',
};

const COLUMNS_FELDS = new Set<RequestPermissionsFieldsNames>(['readColumns', 'readColumnGroup']);
const ROWS_FIELDS = new Set<RequestPermissionsFieldsNames>([
    'readRowGroup',
    'read_row_access_predicate',
]);

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
        rowGroups,
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

    const currentCaption = i18n('field_current', {item: SHORT_TITLE[idmKind] ?? idmKind});

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
                                i18n('action_permissions-types'),
                            ),
                            i18n('action_permissions-types'),
                        )}
                    </>
                ),
                extras: {
                    choices,
                    disabledChoices,
                },
            },
            readColumns: {
                type: 'acl-columns',
                caption: i18n('field_read-columns'),
                required: true,
            },
            readColumnGroup: {
                type: 'acl-group',
                caption: i18n('field_read-column-group'),
                required: true,
                extras: {
                    options: columnGroups,
                },
            },
            readRowGroup: {
                type: 'acl-group',
                caption: i18n('field_read-row-group'),
                required: true,
                extras: {
                    options: rowGroups,
                },
            },
            read_row_access_predicate: {
                type: 'textarea',
                caption: i18n('field_rls-predicate'),
                required: true,
                tooltip: <HelpLink url={UIFactory.docsUrls['acl:row-level-security']} />,
            },
            subjects: {
                type: 'acl-subjects',
                caption: i18n('field_subjects'),
                required: true,
                extras: {
                    placeholder: i18n('context_subjects-placeholder'),
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
                                {i18n('context_comment-notice')}
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
                        value,
                        text: hammer.format['ReadableField'](value),
                    })),
                    hideClear: true,
                    hideFilter: true,
                    with: 'max',
                },
            },
            permissionFlags: {
                type: 'block',
                caption: i18n('field_permission-flags'),
                extras: {children: i18n('context_not-implemented')},
            },
        };
    }, [choices, currentCaption, error, idmKind, columnGroups, rowGroups]);

    const dialogFields = useMemo(() => {
        let flagsIndex = -1;
        const res = requestPermissionsFields.reduce(
            (acc, field) => {
                let allowField;
                switch (aclMode) {
                    case AclMode.COLUMN_GROUPS_PERMISSIONS:
                        allowField = field !== 'permissions' && !ROWS_FIELDS.has(field);
                        break;
                    case AclMode.ROW_GROUPS_PERMISSIONS:
                        allowField = field !== 'permissions' && !COLUMNS_FELDS.has(field);
                        break;
                    default:
                        allowField = !COLUMNS_FELDS.has(field) && !ROWS_FIELDS.has(field);
                }
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
    }, [availableFields, requestPermissionsFields, aclMode]);

    const {
        editAcl = 'Add ACL',
        editColumnsAcl = 'Add columns ACL',
        editRowsAcl = 'Add rows ACL',
    } = buttonsTitle ?? {};
    let title = editAcl;
    switch (aclMode) {
        case AclMode.ROW_GROUPS_PERMISSIONS:
            title = editRowsAcl;
            break;
        case AclMode.COLUMN_GROUPS_PERMISSIONS:
            title = editColumnsAcl;
    }

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
                            validationError.subjects = i18n('alert_subjects-required');
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
