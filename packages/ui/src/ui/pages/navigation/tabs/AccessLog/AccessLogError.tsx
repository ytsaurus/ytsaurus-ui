import React from 'react';
import {useSelector} from '../../../../store/redux-hooks';

import {YTErrorBlock} from '../../../../components/Block/Block';
import {getAccessLogError} from '../../../../store/selectors/navigation/tabs/access-log';

function AccessLogError() {
    const error = useSelector(getAccessLogError);

    return !error ? null : <YTErrorBlock error={error} topMargin={'half'} />;
}

export default React.memo(AccessLogError);
