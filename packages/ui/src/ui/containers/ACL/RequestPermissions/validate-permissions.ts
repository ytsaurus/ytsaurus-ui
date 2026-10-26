import {type AxiosError, type CancelToken} from 'axios';
import {FORM_ERROR} from 'final-form';
import isEqual_ from 'lodash/isEqual';

import {type YTError} from '../../../types';
import {type RequestPermissionsParams} from '../../../store/actions/acl';
import {convertToUIPermissions, getAclSubjectName} from '../../../utils/acl';
import {type Role} from '../../../utils/acl/acl-types';
import type CancelHelper from '../../../utils/cancel-helper';
import {isCancelled} from '../../../utils/cancel-helper';
import {type FormValues, type Props} from './RequestPermissions';
import i18n from './i18n';
import i18nPermissionValues from '../i18n-permission-values';

export interface PermissionsValidationState {
    loading?: boolean;
    warnings?: Array<YTError>;
    validationError?: YTError | Error;
}

export type PermissionsValidationParams = Pick<
    Props,
    'idmKind' | 'requestPermissions' | 'visible'
> & {
    prepareValues: (values: FormValues) => RequestPermissionsParams['values'];
    onValidation: (state: PermissionsValidationState) => void;
};

type ValidatorParams = PermissionsValidationParams & {cancelHelper: CancelHelper};

export function createPermissionsValidator({cancelHelper, ...params}: ValidatorParams) {
    let previousValidation:
        | {
              values: FormValues;
              cancelToken: CancelToken;
              result: Promise<Record<string, unknown>>;
          }
        | undefined;

    return (values: FormValues) => {
        // Message fields can trigger validation again without changing form values.
        if (
            previousValidation &&
            !previousValidation.cancelToken.reason &&
            isEqual_(previousValidation.values, values)
        ) {
            return previousValidation.result;
        }

        const cancelToken = cancelHelper.removeAllAndGenerateNextToken();
        const result = validatePermissions(values, cancelToken, params);
        previousValidation = {values, cancelToken, result};
        return result;
    };
}

async function validatePermissions(
    values: FormValues,
    cancelToken: CancelToken,
    {
        idmKind,
        prepareValues,
        requestPermissions,
        visible,
        onValidation,
    }: PermissionsValidationParams,
) {
    const errors = validateFormValues(values);

    // Final Form also validates while mounting; defer React state updates.
    await Promise.resolve();
    if (cancelToken.reason || !visible) {
        return {...errors, [FORM_ERROR]: true};
    }

    const hasRoles =
        Object.values(values.permissions ?? {}).some((permissions) => permissions.length) ||
        values.readColumnGroup ||
        values.readRowGroup;
    if (errors.subjects || !values.path || !hasRoles) {
        onValidation({});
        return errors;
    }

    onValidation({loading: true});
    try {
        const response = await requestPermissions({
            values: prepareValues(values),
            idmKind,
            simulate: true,
            cancelToken,
        });
        if (cancelToken.reason) {
            return {...errors, [FORM_ERROR]: true};
        }

        const status = response?.status;
        const statuses = status ? [status].flat() : [];
        onValidation({
            warnings: statuses.flatMap(({role, warnings}) => {
                if (!warnings?.length) {
                    return [];
                }
                return [
                    {
                        message: getRoleWarningTitle(role),
                        inner_errors: warnings,
                    },
                ];
            }),
        });
        return errors;
    } catch (validationError) {
        if (cancelToken.reason || isCancelled(validationError)) {
            return {...errors, [FORM_ERROR]: true};
        }
        onValidation({
            validationError:
                (validationError as AxiosError<YTError>).response?.data ??
                (validationError as Error),
        });
        return {...errors, [FORM_ERROR]: true};
    }
}

export function validateFormValues(values: FormValues) {
    return {
        subjects: values.subjects?.length ? undefined : i18n('alert_subjects-required'),
    };
}

function getRoleWarningTitle(role: Role) {
    const name = getAclSubjectName(role.subject);
    if (role.role_type === 'column_read') {
        return `${name} · ${i18n('field_read-column-group')}: ${role.column_group_id}`;
    }
    if (role.role_type === 'row_read') {
        return `${name} · ${i18n('field_read-row-group')}: ${role.row_group_id}`;
    }
    const permissions = convertToUIPermissions(role).permissions?.map((permission) =>
        i18nPermissionValues(`value_${permission}`),
    );
    if (!permissions?.length) {
        return name;
    }
    return `${name} · ${permissions.join(', ')}`;
}
