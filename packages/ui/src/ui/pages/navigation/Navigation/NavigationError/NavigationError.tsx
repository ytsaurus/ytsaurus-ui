import React from 'react';
import cn from 'bem-cn-lite';
import {type YTError} from '../../../../../@types/types';
import NavigationDescription from '../../../../pages/navigation/NavigationDescription/NavigationDescription';
import {getPermissionDeniedError} from '../../../../utils/errors';
import {PrettyError} from '../../../../containers/PrettyError';
import {type ErrorsInfoMap, determineErrorCode} from '../../../../containers/PrettyError/helpers';

import ypath from '../../../../common/thor/ypath';

import {RequestPermission} from './RequestPermission';
import i18n from './i18n';

const block = cn('navigation-error');

type Props = {
    path?: string;
    details: YTError;
    cluster: string;
    vertical?: boolean;
    className?: string;
};

const ErrorsInfo: ErrorsInfoMap = {
    901: {
        getTitle: ({username, permissions, path}) => {
            const permission = permissions?.map((perm) => ypath.getValue(perm)).join(' | ');
            const permissionsStr = permission ? `"${permission}"` : '';
            return i18n('alert_no-permission-access', {
                username,
                permissions: permissionsStr,
                path,
            });
        },
    },
    500: {
        getTitle: ({path}) => i18n('alert_path-not-exist', {path}),
    },
};

export function NavigationError(props: Props) {
    const {details, path, cluster, vertical, className} = props;

    const errorCode = determineErrorCode(details, ErrorsInfo);
    const error = errorCode === 901 ? getPermissionDeniedError(details)! : details;

    return (
        <div className={block(null, className)}>
            <PrettyError
                error={details}
                errorCode={errorCode}
                errorsInfo={ErrorsInfo}
                errorContext={{path}}
                vertical={vertical}
                renderAdditionalContent={() =>
                    errorCode === 901 ? (
                        <NavigationDescription className="error-description" />
                    ) : undefined
                }
                renderActions={
                    errorCode === 901
                        ? () => <RequestPermission cluster={cluster} path={path} error={error} />
                        : undefined
                }
            />
        </div>
    );
}
