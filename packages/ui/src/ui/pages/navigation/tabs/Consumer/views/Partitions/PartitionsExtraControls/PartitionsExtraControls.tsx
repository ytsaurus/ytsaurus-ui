import {connect} from 'react-redux';
import {
    changeConsumerPartitionIndex,
    changeConsumerPartitionsColumns,
    changeConsumerRateMode,
    changeConsumerTimeWindow,
} from '../../../../../../../store/actions/navigation/tabs/consumer/filters';
import {type RootState} from '../../../../../../../store/reducers';
import {
    selectConsumerPartitionIndex,
    selectConsumerPartitionsColumns,
    selectConsumerRateMode,
    selectConsumerTimeWindow,
} from '../../../../../../../store/selectors/navigation/tabs/consumer';

import '../PartitionsExtraControls.scss';

import {PartitionsExtraControlsBase} from './PartitionsExtraControlsBase';

function mapStateToProps(state: RootState) {
    return {
        consumerPartitionIndex: selectConsumerPartitionIndex(state),
        consumerRateMode: selectConsumerRateMode(state),
        consumerTimeWindow: selectConsumerTimeWindow(state),
        partitionsColumns: selectConsumerPartitionsColumns(state),
    };
}

const mapDispatchToProps = {
    changeConsumerPartitionIndex,
    changeConsumerRateMode,
    changeConsumerTimeWindow,
    changeConsumerPartitionsColumns,
};

export const PartitionsExtraControls = connect(
    mapStateToProps,
    mapDispatchToProps,
)(PartitionsExtraControlsBase);
