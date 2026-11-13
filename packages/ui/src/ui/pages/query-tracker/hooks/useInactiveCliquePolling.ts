import {useEffect} from 'react';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {
    selectQueryDraftCluster,
    selectShouldPollCliqueWhenInactive,
} from '../../../store/selectors/query-tracker/query';
import {loadCliqueByCluster} from '../../../store/actions/query-tracker/query';
import {QueryEngine} from '../../../../shared/constants/engines';

export function useInactiveCliquePolling() {
    const dispatch = useDispatch();
    const cluster = useSelector(selectQueryDraftCluster);
    const active = useSelector(selectShouldPollCliqueWhenInactive);
    useEffect(() => {
        if (!active || !cluster) return undefined;
        const timer = setInterval(
            () => dispatch(loadCliqueByCluster(QueryEngine.CHYT, cluster)),
            5000,
        );
        return () => clearInterval(timer);
    }, [dispatch, active, cluster]);
}
