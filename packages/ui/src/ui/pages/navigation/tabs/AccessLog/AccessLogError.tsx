import React from 'react';
import {useSelector} from 'react-redux';

import {YTErrorBlock} from '../../../../components/Block/Block';
import {getAccessLogError} from '../../../../store/selectors/navigation/tabs/access-log';

function AccessLogError() {
    const error = useSelector(getAccessLogError);

    return !error ? null : <YTErrorBlock error={error} topMargin={'half'} />;
}

export default React.memo(AccessLogError);
