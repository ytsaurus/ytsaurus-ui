import React from 'react';
import {useRouteMatch} from 'react-router';
import {useFlowExecuteQuery} from '../../../../store/api/yt/flow';
import {filtersSlice} from '../../../../store/reducers/flow/filters';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {getFlowPipelinePath} from '../../../../store/selectors/flow/filters';

export function FlowWorker() {
    const dispatch = useDispatch();

    const {
        params: {worker},
    } = useRouteMatch<{worker: string}>();

    React.useEffect(() => {
        dispatch(filtersSlice.actions.updateFlowFilters({currentWorker: worker}));
        return () => {
            dispatch(filtersSlice.actions.updateFlowFilters({currentWorker: ''}));
        };
    }, [worker, dispatch]);

    return <>Not implemented, worker: {worker}</>;
}

function useFlowWorkerData(worker: string) {
    const pipeline_path = useSelector(getFlowPipelinePath);
    return useFlowExecuteQuery<'describe-computation'>({
        parameters: {
            flow_command: 'describe-computation',
            pipeline_path,
        },
        body: {
            worker_incarnation_id: worker,
        },
    });
}
