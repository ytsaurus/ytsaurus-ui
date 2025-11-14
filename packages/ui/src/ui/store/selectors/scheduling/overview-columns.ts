import {createSelector} from 'reselect';
import uniq_ from 'lodash/uniq';
import compact_ from 'lodash/compact';

import {getSettingsData} from '../../../store/selectors/settings/settings-base';
import {SchedulingColumn, isSchedulingColumnName} from '../../../utils/scheduling/detailsTable';

const DEFAULT_COLUMNS: Array<SchedulingColumn> = [
    'name',
    'FI',
    'weight',
    'fair_share_usage',
    'fair_share',
    'usage',
    'demand',
    'min_share',
    'operation_overview',
    'dominant_resource',
    'actions',
];

export const getSchedulingOverivewColumns = createSelector([getSettingsData], (data) => {
    const columns = data['global::scheduling::overviewColumns'];
    if (!columns) {
        return [...DEFAULT_COLUMNS];
    }

    const resColumns: Array<SchedulingColumn> = compact_([
        'name' as const,
        ...columns.map((item) => {
            return isSchedulingColumnName(item) ? item : undefined;
        }),
        'actions' as const,
    ]);
    return uniq_(resColumns);
});
