import React from 'react';

import {YTErrorBlock} from '../../../../../containers/Block/Block';
import Loader from '../../../../../components/Loader/Loader';
import {YsonWithScroll} from '../../../../../components/Yson/YsonWithScroll';
import {YTApiId} from '../../../../../rum/rum-wrap-api';
import {getPoolPathsByName} from '../../../../../store/actions/scheduling/expanded-pools';
import {useFetchBatchQuery} from '../../../../../store/api/yt';
import {getCurrentPool} from '../../../../../store/selectors/scheduling/scheduling';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import {type PoolTreeNode} from '../../../../../utils/scheduling/pool-child';
import i18n from './i18n';

export function PoolAttributes({className}: {className: string}) {
    const pool = useSelector(getCurrentPool);

    if (!pool) {
        return null;
    }

    return <PoolAttributesFetched className={className} pool={pool} />;
}

function PoolAttributesFetched({className, pool}: {className?: string; pool: PoolTreeNode}) {
    const dispatch = useDispatch();
    const res = React.useMemo(() => {
        return dispatch(getPoolPathsByName(pool.name));
    }, [dispatch, pool.name]);

    const {data, error, isLoading} = useFetchBatchQuery<unknown>({
        id: YTApiId.schedulingPoolAttributes,
        errorTitle: i18n('alert_failed-to-load'),
        parameters: {
            requests: [{command: 'get', parameters: {path: res.orchidPath}}],
        },
    });

    return (
        <div className={className}>
            {isLoading && <Loader />}
            {Boolean(error) && <YTErrorBlock error={error} />}
            <YsonWithScroll value={data?.[0]?.output ?? null} />
        </div>
    );
}
