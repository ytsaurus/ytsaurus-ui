import {connect} from 'react-redux';

import {
    getCompetitiveJobs,
    getJobs,
    hideInputPaths,
    showInputPaths,
    showJobAttributesModal,
} from '../../../../../../store/actions/operations/jobs';
import {promptAction, showErrorModal} from '../../../../../../store/actions/actions';
import {getShowCompetitiveJobs} from '../../../../../../pages/operations/selectors';
import {selectJobsOperationId} from '../../../../../../store/selectors/operations/jobs';
import {
    selectOperationId,
    selectOperationTasksNames,
} from '../../../../../../store/selectors/operations/operation';
import {selectMergedUiSettings} from '../../../../../../store/selectors/global/cluster';
import './OperationJobsTable.scss';
import {UI_COLLAPSIBLE_SIZE} from '../../../../../../constants/global';

import {OperationJobsTableBase} from './OperationJobsTableBase';

function mapStateToProps(state, props) {
    const {operations, global} = state;
    const {cluster, login} = global;
    const showCompetitiveJobs = getShowCompetitiveJobs(state);
    const taskNamesNumber = selectOperationTasksNames(state)?.length;
    const jobsOperationId = selectJobsOperationId(state);
    const operationId = selectOperationId(state);
    const {jobs, job, competitiveJobs, inputPaths} = operations.jobs;
    const uiSettings = selectMergedUiSettings(state);
    return {
        jobs: operationId !== jobsOperationId ? [] : jobs,
        job,
        competitiveJobs,
        showCompetitiveJobs,
        inputPaths,
        cluster,
        login,
        operationId,
        collapsibleSize: UI_COLLAPSIBLE_SIZE,
        isLoading: props.isLoading || operationId !== jobsOperationId,
        taskNamesNumber,
        uiSettings,
    };
}

const mapDispatchToProps = {
    showJobAttributesModal,
    showInputPaths,
    hideInputPaths,
    showErrorModal,
    promptAction,
    getJobs,
    getCompetitiveJobs,
};

const OperationJobsTable = connect(mapStateToProps, mapDispatchToProps)(OperationJobsTableBase);

export default OperationJobsTable;
