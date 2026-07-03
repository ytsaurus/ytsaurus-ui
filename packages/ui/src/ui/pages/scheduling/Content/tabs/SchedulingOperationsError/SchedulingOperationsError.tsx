import React from 'react';
import {useSelector} from '../../../../../store/redux-hooks';

import {YTErrorBlock} from '../../../../../containers/Block/Block';
import {selectSchedulingOperationsError} from '../../../../../store/selectors/scheduling/expanded-pools';

function SchedulingOperationsError() {
    const error = useSelector(selectSchedulingOperationsError);
    return !error ? null : <YTErrorBlock error={error} topMargin={'none'} />;
}

export default React.memo(SchedulingOperationsError);
