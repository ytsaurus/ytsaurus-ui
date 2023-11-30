import React from 'react';
import {getPool, getTree} from '../../../store/selectors/scheduling/scheduling';
import {useDispatch, useSelector} from 'react-redux';
import {loadExpandedPools} from '../../../store/actions/scheduling/expanded-pools';

function SchedulingExpandedPoolsUpdater() {
    const tree = useSelector(getTree);
    const name = useSelector(getPool);

    const dispatch = useDispatch();

    React.useEffect(() => {
        dispatch(loadExpandedPools(tree));
    }, [dispatch, tree, name]);

    return null;
}

export default React.memo(SchedulingExpandedPoolsUpdater);
