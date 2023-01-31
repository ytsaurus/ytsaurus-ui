import React from 'react';
import {getCurrentPool, getTree} from '../../../store/selectors/scheduling/scheduling';
import {useDispatch, useSelector} from 'react-redux';
import {loadSchedulingOperationsPerPool} from '../../../store/actions/scheduling/scheduling-operations';

function SchedulingOperationsUpdater() {
    const dispatch = useDispatch();

    const tree = useSelector(getTree);
    const pool = useSelector(getCurrentPool);

    const name = pool?.name;

    React.useEffect(() => {
        dispatch(loadSchedulingOperationsPerPool(tree));
    }, [dispatch, tree, name]);

    return null;
}

export default React.memo(SchedulingOperationsUpdater);
