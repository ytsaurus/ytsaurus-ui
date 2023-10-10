import React from 'react';
import {getCurrentPool, getTree} from '../../../store/selectors/scheduling/scheduling';
import {useDispatch, useSelector} from 'react-redux';
import {loadExpandedPools} from '../../../store/actions/scheduling/expanded-pools';

function SchedulingExpandedPoolsUpdater() {
    const dispatch = useDispatch();

    const tree = useSelector(getTree);
    const pool = useSelector(getCurrentPool);

    const name = pool?.name;

    React.useEffect(() => {
        dispatch(loadExpandedPools(tree));
    }, [dispatch, tree, name]);

    return null;
}

export default React.memo(SchedulingExpandedPoolsUpdater);
