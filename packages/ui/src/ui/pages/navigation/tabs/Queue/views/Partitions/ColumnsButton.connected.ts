// YTFRONT-3327-column-button
import {connect} from 'react-redux';

import ColumnsButton from '../../../../../../pages/navigation/tabs/Queue/ColumnsButton/ColumnsButton';
import {setSettingsNavigationQueuePartitionsVisibility} from '../../../../../../store/actions/settings/settings';
import type {RootState} from '../../../../../../store/reducers';
import {getSettingsNavigationQueuePartitionsVisibility} from '../../../../../../store/selectors/settings-ts';

const allColumns = [
    {
        key: 'partition_index',
        name: 'Partition idx',
    },
    {
        key: 'error',
        name: 'Error',
    },
    {
        key: 'host',
        name: 'Tablet cell host',
    },
    {
        key: 'cell_id',
        name: 'Tablet cell ID',
    },
    {
        key: 'read_rate',
        name: 'Read rate',
    },
    {
        key: 'write_rate',
        name: 'Write rate',
    },
    {
        key: 'lower_row_index',
        name: 'Lower row index',
    },
    {
        key: 'upper_row_index',
        name: 'Upper row index',
    },
    {
        key: 'available_row_count',
        name: 'Available row count',
    },
    {
        key: 'commit_idle_time',
        name: 'Commit idle time, ms',
    },
    {
        key: 'last_row_commit_time',
        name: 'Last row commit time',
    },
];

function mapStateToProps(state: RootState) {
    return {
        allColumns,
        selectedColumns: getSettingsNavigationQueuePartitionsVisibility(state),
    };
}

const mapDispatchToProps = {
    onChange: setSettingsNavigationQueuePartitionsVisibility,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
// type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(ColumnsButton);
