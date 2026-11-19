import React from 'react';

import {type YTError} from '../../../@types/types';
import {YTErrorBlock} from '../Block/Block';
import {PrettyError} from '../PrettyError';
import {type ErrorsInfoMap, determineErrorCode} from '../PrettyError/helpers';
import {RoutedButton} from '../RoutedButton/RoutedButton';
import {makeOperationJobsUrl, makeOperationsUrl} from '../../utils/app-url';
import i18n from './i18n';

const ERRORS_INFO: ErrorsInfoMap = {
    1915: {
        getTitle: () => i18n('alert_operation-not-found'),
    },
    1916: {
        getTitle: () => i18n('alert_job-or-operation-not-found'),
    },
};

type OperationErrorProps = {
    error?: YTError;
    message?: React.ReactNode;
    cluster: string;
    operationId: string;
};

export function OperationError({error, message, cluster, operationId}: OperationErrorProps) {
    const errorCode = error && determineErrorCode(error, ERRORS_INFO);

    if (!error || !errorCode) {
        return <YTErrorBlock message={message} error={error} />;
    }

    const operationNotFound = errorCode === 1915;

    return (
        <PrettyError
            error={error}
            errorCode={errorCode}
            errorsInfo={ERRORS_INFO}
            renderActions={() => (
                <RoutedButton
                    view="outlined"
                    href={
                        operationNotFound
                            ? makeOperationsUrl({cluster})
                            : makeOperationJobsUrl({cluster, operationId})
                    }
                >
                    {operationNotFound
                        ? i18n('action_go-to-operations')
                        : i18n('action_go-to-jobs')}
                </RoutedButton>
            )}
        />
    );
}
