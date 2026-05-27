import React from 'react';
import {useSelector} from '../../../../store/redux-hooks';

import {YTErrorBlock} from '../../../../containers/Block/Block';
import {selectAccessLogError} from '../../../../store/selectors/navigation/tabs/access-log';

function AccessLogError() {
    const error = useSelector(selectAccessLogError);

    return !error ? null : <YTErrorBlock error={error} topMargin={'half'} />;
}

export default React.memo(AccessLogError);
