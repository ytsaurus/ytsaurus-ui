import React from 'react';
import {selectPool, selectTree} from '../../../store/selectors/scheduling/scheduling';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {loadExpandedPools} from '../../../store/actions/scheduling/expanded-pools';

function SchedulingExpandedPoolsUpdater() {
    const tree = useSelector(selectTree);
    const name = useSelector(selectPool);

    const dispatch = useDispatch();

    React.useEffect(() => {
        dispatch(loadExpandedPools(tree));
    }, [dispatch, tree, name]);

    return null;
}

export default React.memo(SchedulingExpandedPoolsUpdater);
