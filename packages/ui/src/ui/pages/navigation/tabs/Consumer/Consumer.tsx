import {connect} from 'react-redux';
import {loadConsumerStatus} from '../../../../store/actions/navigation/tabs/consumer/status';
import {type RootState} from '../../../../store/reducers';
import {
    selectConsumerMode,
    selectOwner,
    selectPartitionCount,
    selectQueueAgentHost,
    selectReadDataWeightRate,
    selectReadRowCountRate,
    selectStatusError,
} from '../../../../store/selectors/navigation/tabs/consumer';

import {ConsumerBase} from './ConsumerBase';

function mapStateToProps(state: RootState) {
    return {
        owner: selectOwner(state),
        partitionCount: selectPartitionCount(state),
        queueAgentHost: selectQueueAgentHost(state),
        readDataWeightRate: selectReadDataWeightRate(state),
        readRowCountRate: selectReadRowCountRate(state),
        consumerMode: selectConsumerMode(state),
        statusError: selectStatusError(state),
    };
}

const mapDispatchToProps = {
    loadConsumerStatus,
};

const Consumer = connect(mapStateToProps, mapDispatchToProps)(ConsumerBase);

export default Consumer;
