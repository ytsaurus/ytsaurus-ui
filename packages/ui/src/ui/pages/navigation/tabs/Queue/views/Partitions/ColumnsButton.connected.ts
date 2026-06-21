// YTFRONT-3327-column-button
import {connect} from 'react-redux';

import ColumnsButton from '../../../../../../pages/navigation/tabs/Queue/ColumnsButton/ColumnsButton';
import {setSettingsNavigationQueuePartitionsVisibility} from '../../../../../../store/actions/settings/settings';
import {type RootState} from '../../../../../../store/reducers';
import {selectSettingsNavigationQueuePartitionsVisibility} from '../../../../../../store/selectors/settings/settings-ts';
import i18n from './i18n';

const allColumns = [
    {
        key: 'partition_index',
        get name() {
            return i18n('field_partition-idx');
        },
    },
    {
        key: 'error',
        get name() {
            return i18n('field_error');
        },
    },
    {
        key: 'host',
        get name() {
            return i18n('field_host');
        },
    },
    {
        key: 'cell_id',
        get name() {
            return i18n('field_cell-id');
        },
    },
    {
        key: 'read_rate',
        get name() {
            return i18n('field_read-rate');
        },
    },
    {
        key: 'write_rate',
        get name() {
            return i18n('field_write-rate');
        },
    },
    {
        key: 'lower_row_index',
        get name() {
            return i18n('field_lower-row-idx');
        },
    },
    {
        key: 'upper_row_index',
        get name() {
            return i18n('field_upper-row-idx');
        },
    },
    {
        key: 'available_row_count',
        get name() {
            return i18n('field_available-rows');
        },
    },
    {
        key: 'commit_idle_time',
        get name() {
            return i18n('field_commit-idle-time');
        },
    },
    {
        key: 'last_row_commit_time',
        get name() {
            return i18n('field_last-row-commit-time');
        },
    },
];

function mapStateToProps(state: RootState) {
    return {
        allColumns,
        selectedColumns: selectSettingsNavigationQueuePartitionsVisibility(state),
    };
}

const mapDispatchToProps = {
    onChange: setSettingsNavigationQueuePartitionsVisibility,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
// type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(ColumnsButton);
