import React from 'react';
import {type YTError} from '../../../../@types/types';
import {PrettyError} from '../../../containers/PrettyError';
import {type ErrorsInfoMap} from '../../../containers/PrettyError/helpers';

import i18n from './i18n';

const ErrorsInfo: ErrorsInfoMap = {
    500: {
        getTitle: ({poolName}) => i18n('pool_not_found', {poolName}),
    },
};

type Props = {
    error: YTError;
    poolName?: string;
    className?: string;
};

export function SchedulingError({error, poolName, className}: Props) {
    return (
        <PrettyError
            className={className}
            error={error}
            errorsInfo={ErrorsInfo}
            errorContext={{poolName}}
            title={i18n('pool_not_found', {poolName})}
        />
    );
}
