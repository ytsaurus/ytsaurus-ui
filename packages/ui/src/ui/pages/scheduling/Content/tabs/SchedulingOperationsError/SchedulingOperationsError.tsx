import React from 'react';
import {useSelector} from '../../../../../store/redux-hooks';

import {YTErrorBlock} from '../../../../../components/Error/Error';
import {getSchedulingOperationsError} from '../../../../../store/selectors/scheduling/expanded-pools';

function SchedulingOperationsError() {
    const error = useSelector(getSchedulingOperationsError);
    return !error ? null : <YTErrorBlock error={error} topMargin={'none'} />;
}

export default React.memo(SchedulingOperationsError);
