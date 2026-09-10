import {connect} from 'react-redux';
import {
    changeQueuePartitionIndex,
    changeQueuePartitionsColumns,
    changeQueueRateMode,
    changeQueueTabletCellHost,
    changeQueueTabletCellId,
    changeQueueTimeWindow,
} from '../../../../../../../store/actions/navigation/tabs/queue/filters';
import {type RootState} from '../../../../../../../store/reducers';
import {
    selectQueuePartitionIndex,
    selectQueuePartitionsColumns,
    selectQueueRateMode,
    selectQueueTabletCellHost,
    selectQueueTabletCellId,
    selectQueueTimeWindow,
} from '../../../../../../../store/selectors/navigation/tabs/queue';

import '../PartitionsExtraControls.scss';

import {PartitionsExtraControlsBase} from './PartitionsExtraControlsBase';

function mapStateToProps(state: RootState) {
    return {
        queuePartitionIndex: selectQueuePartitionIndex(state),
        queueTabletCellHost: selectQueueTabletCellHost(state),
        queueTabletCellId: selectQueueTabletCellId(state),
        queueRateMode: selectQueueRateMode(state),
        queueTimeWindow: selectQueueTimeWindow(state),
        queuePartitionsColumns: selectQueuePartitionsColumns(state),
    };
}

const mapDispatchToProps = {
    changeQueuePartitionIndex,
    changeQueueTabletCellHost,
    changeQueueTabletCellId,
    changeQueueRateMode,
    changeQueueTimeWindow,
    changeQueuePartitionsColumns,
};

export const PartitionsExtraControls = connect(
    mapStateToProps,
    mapDispatchToProps,
)(PartitionsExtraControlsBase);
