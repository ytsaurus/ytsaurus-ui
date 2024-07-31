import {createSelector} from 'reselect';
import map_ from 'lodash/map';
import {RootState} from '../../../store/reducers';

export const getFlowLayoutPipelinePath = (state: RootState) => state.flow.layout.pipeline_path;
export const getFlowLayoutError = (state: RootState) => state.flow.layout.error;

const getFlowLayoutRawData = (state: RootState) => state.flow.layout.data;

export const getFlowLayoutData = createSelector([getFlowLayoutRawData], (data) => {
    const {jobs = {}, partitions} = data?.execution_spec?.layout?.value ?? {};
    return map_(partitions, (item) => {
        const job = jobs[item.current_job_id!];
        const {worker_address} = job ?? {};
        const worker = data?.workers[worker_address];
        return {
            partition: item,
            job,
            worker,
        };
    }).sort(({partition: l}, {partition: r}) => {
        if (l.computation_id === r.computation_id) {
            return 0;
        }
        return l.computation_id > r.computation_id ? 1 : -1;
    });
});
