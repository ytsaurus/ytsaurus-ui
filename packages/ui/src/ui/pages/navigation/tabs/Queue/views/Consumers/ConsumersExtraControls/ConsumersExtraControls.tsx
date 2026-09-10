import {connect} from 'react-redux';
import {
    changeQueueConsumerName,
    changeQueueOwner,
    changeQueueRateMode,
    changeQueueTimeWindow,
} from '../../../../../../../store/actions/navigation/tabs/queue/filters';
import {type RootState} from '../../../../../../../store/reducers';
import {
    selectQueueConsumerName,
    selectQueueOwner,
    selectQueueRateMode,
    selectQueueTimeWindow,
} from '../../../../../../../store/selectors/navigation/tabs/queue';

import '../ConsumersExtraControls.scss';

import {ConsumersExtraControlsBase} from './ConsumersExtraControlsBase';

function mapStateToProps(state: RootState) {
    return {
        queueConsumerName: selectQueueConsumerName(state),
        queueOwner: selectQueueOwner(state),
        queueRateMode: selectQueueRateMode(state),
        queueTimeWindow: selectQueueTimeWindow(state),
    };
}

const mapDispatchToProps = {
    changeQueueConsumerName,
    changeQueueOwner,
    changeQueueRateMode,
    changeQueueTimeWindow,
};

export const ConsumersExtraControls = connect(
    mapStateToProps,
    mapDispatchToProps,
)(ConsumersExtraControlsBase);
