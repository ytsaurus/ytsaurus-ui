import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import WithStickyToolbar from '../../../../components/WithStickyToolbar/WithStickyToolbar';
import {
    accessLogResetFilters,
    fetchAccessLog,
} from '../../../../store/actions/navigation/tabs/access-log/access-log';

import AccessLogTable from './AccessLogTable';
import AccessLogError from './AccessLogError';
import AccessLogFilters from './AccessLogFilters';
import {getPath} from '../../../../store/selectors/navigation';

function AccessLog() {
    const dispatch = useDispatch();
    const path = useSelector(getPath);

    React.useEffect(() => {
        dispatch(accessLogResetFilters());
        dispatch(fetchAccessLog());
    }, [dispatch, path]);

    return (
        <React.Fragment>
            <WithStickyToolbar
                doubleHeight
                toolbar={<AccessLogFilters />}
                content={
                    <React.Fragment>
                        <AccessLogError />
                        <AccessLogTable />
                    </React.Fragment>
                }
            />
        </React.Fragment>
    );
}

export default React.memo(AccessLog);
