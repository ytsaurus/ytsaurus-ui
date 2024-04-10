import {compose} from 'redux';
import cn from 'bem-cn-lite';
import React, {useCallback, useMemo} from 'react';
import {DialogField, FormApi, YTDFDialog, makeErrorFields} from '../../../components/Dialog/Dialog';
import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import Button from '../../../components/Button/Button';
import PermissionsControl from '../RequestPermissions/PermissionsControl/PermissionsControl';

import withVisible, {WithVisibleProps} from '../../../hocs/withVisible';

import './RequestPermissions.scss';
import {YTError} from '../../../types';
import {INHERITANCE_MODE_TYPES, IdmObjectType} from '../../../constants/acl';

import UIFactory from '../../../UIFactory';
import hammer from '../../../common/hammer';
import {map} from 'lodash';

import {docsUrl} from '../../../config';
import {makeLink} from '../../../utils/utils';
import {AclColumnGroup, IdmKindType} from '../../../utils/acl/acl-types';
import {YTPermissionTypeUI} from '../../../utils/acl/acl-api';
import {PermissionToRequest} from '../../../store/actions/acl';

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
    | 'readColumnGroup';

export interface Props extends WithVisibleProps {
    buttonText?: string;
    className?: string;
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
} & Record<`${typeof FLAG_NAME_PREFIX}${string}`, boolean>;

const SHORT_TITLE: Partial<Record<IdmKindType, string>> = {
    access_control_object: 'ACO',
};

function RequestPermissions(props: Props) {
    const {
        buttonText = 'Request permissions',
        visible,
        handleShow,
        handleClose,
        className,
        path,
        idmKind,
        requestPermissions,
        cancelRequestPermissions,
        error,
        cluster,
        columnGroups,
        /*denyColumns,*/
    } = props;

    const onClose = useCallback(() => {
        handleClose();
        cancelRequestPermissions({idmKind});
    }, [handleClose, cancelRequestPermissions, idmKind]);

    const {requestPermissionsFields, requestPermissionsFlags = {}} = UIFactory.getAclApi();

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

    const currentCaption = `Current ${SHORT_TITLE[idmKind] ?? idmKind}`;
    const {permissionsToRequest: choices} = UIFactory.getAclPermissionsSettings()[idmKind];

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
                caption: 'Cluster',
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
                caption: 'Permissions',
                tooltip: (
                    <>
                        {docsUrl(
                            makeLink(UIFactory.docsUrls['acl:permissions'], 'Permissions types'),
                            'Permissions types',
                        )}
                    </>
                ),
                extras: {
                    choices: choices,
                    disabledChoices,
                },
            },
            readColumnGroup: {
                type: 'acl-column-group',
                caption: 'Column permissions',
                extras: {
                    columnGroups,
                },
            },
            subjects: {
                type: 'acl-subjects',
                caption: 'Subjects',
                required: false,
                extras: {
                    placeholder: 'Enter group name, user name or login...',
                    allowedTypes: ['users', 'groups', 'app'],
                },
            },
            duration: {
                type: 'before-date',
                caption: 'Duration',
            },
            commentHeader: {
                type: 'block',
                className: block('modal-comments-header'),
                extras: {
                    children: (
                        <React.Fragment>
                            <div className={'is-dialog__label'}>Comment</div>
                            <div className={block('comment-notice')}>
                                Teams and people can be requested through the IDM after the access
                                group is created. If you have a more complex case please describe it
                                in the comments.
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
                caption: 'Inheritance mode',
                extras: {
                    items: map(INHERITANCE_MODE_TYPES, (value) => ({
                        value: value,
                        text: hammer.format['ReadableField'](value),
                    })),
                    hideClear: true,
                    hideFilter: true,
                    with: 'max',
                },
            },
            permissionFlags: {
                type: 'block',
                caption: 'Permission flags',
                extras: {children: 'Not implemented'},
            },
        };
    }, [choices, currentCaption, error, idmKind]);

    const dialogFields = useMemo(() => {
        let flagsIndex = -1;
        const res = requestPermissionsFields.map((name, index) => {
            if (name === 'permissionFlags') {
                flagsIndex = index;
            }

            return {
                ...availableFields[name],
                name: name,
            } as DialogField<FormValues>;
        });
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
    }, [availableFields, requestPermissionsFields]);

    return !choices?.length ? null : (
        <ErrorBoundary>
            <div className={block(null, className)}>
                <Button view={'action'} onClick={handleShow}>
                    {buttonText}
                </Button>
                <YTDFDialog<FormValues>
                    pristineSubmittable
                    onClose={onClose}
                    className={block('modal')}
                    visible={Boolean(visible)}
                    onAdd={onAdd}
                    headerProps={{
                        title: 'Request permissions',
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
