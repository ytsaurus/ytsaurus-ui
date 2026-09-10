import {connect} from 'react-redux';
import {loadQueueStatus} from '../../../../store/actions/navigation/tabs/queue/status';
import {type RootState} from '../../../../store/reducers';
import {
    selectFamily,
    selectPartitionCount,
    selectQueueAgentHost,
    selectQueueMode,
    selectStatusError,
    selectWriteDataWeightRate,
    selectWriteRowCountRate,
} from '../../../../store/selectors/navigation/tabs/queue';

import {QueueBase} from './QueueBase';

function mapStateToProps(state: RootState) {
    return {
        family: selectFamily(state),
        partitionCount: selectPartitionCount(state),
        queueAgentHost: selectQueueAgentHost(state),
        writeDataWeightRate: selectWriteDataWeightRate(state),
        writeRowCountRate: selectWriteRowCountRate(state),
        queueMode: selectQueueMode(state),
        statusError: selectStatusError(state),
    };
}

const mapDispatchToProps = {
    loadQueueStatus,
};

const Queue = connect(mapStateToProps, mapDispatchToProps)(QueueBase);

export default Queue;
