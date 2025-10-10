import React from 'react';
import map_ from 'lodash/map';
import cn from 'bem-cn-lite';

import {useSelector} from '../../../../../../store/redux-hooks';
import {getJobsErrors} from '../../../../../../store/selectors/operations/jobs';
import {YTErrorBlock} from '../../../../../../components/Error/Error';

import './OperationJobsErrors.scss';

const block = cn('operation-jobs-errors');

function OperationJobsErrors() {
    const errors = useSelector(getJobsErrors);

    return (
        <div className={block()}>
            {map_(errors, (error, index) => {
                return <YTErrorBlock key={index} error={error} />;
            })}
        </div>
    );
}

export default React.memo(OperationJobsErrors);
