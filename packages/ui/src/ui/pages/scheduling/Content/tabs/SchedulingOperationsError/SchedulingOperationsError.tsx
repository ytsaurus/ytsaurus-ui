import React from 'react';
import {useSelector} from 'react-redux';

import ErrorBlock from '../../../../../components/Error/Error';
import {getSchedulingOperationsError} from '../../../../../store/selectors/scheduling/expanded-pools';

function SchedulingOperationsError() {
    const error = useSelector(getSchedulingOperationsError);
    return !error ? null : <ErrorBlock error={error} topMargin={'none'} />;
}

export default React.memo(SchedulingOperationsError);
