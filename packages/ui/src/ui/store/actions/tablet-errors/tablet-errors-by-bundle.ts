import {ThunkAction} from 'redux-thunk';
import {RootState} from '../../../store/reducers';
import {TabletErrorsApi, fetchFromTabletErrorsApi} from '../../../../shared/tablet-errors-manager';
import {getCluster} from '../../../store/selectors/global';
import {tabletErrorsByBundleActions} from '../../../store/reducers/tablet-errors/tablet-errors-by-bundle';
import CancelHelper from '../../../utils/cancel-helper';
import {getTabletErrorsByBundleData} from '../../../store/selectors/tablet-errors/tablet-errors-by-bundle';

type AsyncAction<T = Promise<void>> = ThunkAction<T, RootState, unknown, any>;

const cancelHelper = new CancelHelper();

export function loadTabletErrorsByBundle(
    page: number,
    params: Pick<
        TabletErrorsApi['tablet_errors_by_bundle']['body'],
        'tablet_cell_bundle' | 'start_timestamp' | 'end_timestamp' | 'methods' | 'table_path'
    >,
): AsyncAction {
    return (dispatch, getState) => {
        dispatch(tabletErrorsByBundleActions.onRequest({bundle: params.tablet_cell_bundle}));

        const state = getState();
        const cluster = getCluster(state);
        const data = getTabletErrorsByBundleData(state);

        return fetchFromTabletErrorsApi(
            'tablet_errors_by_bundle',
            cluster,
            {
                ...params,
                offset: page * 100,
                count_limit: 100,
                ...(page !== 0 && data?.fixed_end_timestamp
                    ? {fixed_end_timestamp: data?.fixed_end_timestamp}
                    : {}),
            },
            cancelHelper.removeAllAndGenerateNextToken(),
        )
            .then(({data}) => {
                dispatch(
                    tabletErrorsByBundleActions.onSuccess({
                        data,
                        ...(page === 0 ? {total_row_count: data.total_row_count} : {}),
                    }),
                );
            })
            .catch((error) => {
                dispatch(tabletErrorsByBundleActions.onError({error}));
            });
    };
}

export function updateTimeRange(from: number, to: number): AsyncAction<void> {
    return (dispatch) => {
        dispatch(tabletErrorsByBundleActions.updateFilter({timeRangeFilter: {from, to}}));
    };
}
