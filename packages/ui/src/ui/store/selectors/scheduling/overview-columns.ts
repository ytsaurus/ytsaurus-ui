import {createSelector} from 'reselect';
import uniq_ from 'lodash/uniq';

import {OVERVIEW_AVAILABLE_COLUMNS} from '../../../utils/scheduling/overviewTable';
import {getSettingsData} from '../../../store/selectors/settings/settings-base';
import {SchedulingOverviewColumnNames} from '../../../../shared/constants/settings-types';

const DEFAULT_COLUMNS: Array<SchedulingOverviewColumnNames> = [
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

    const availableColumns = new Set(OVERVIEW_AVAILABLE_COLUMNS);

    const resColumns: typeof columns = [
        'name',
        ...columns.filter((item) => availableColumns.has(item)),
        'actions',
    ];
    return uniq_(resColumns);
});
