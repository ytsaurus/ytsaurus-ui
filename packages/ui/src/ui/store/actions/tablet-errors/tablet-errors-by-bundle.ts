import {ThunkAction} from 'redux-thunk';
import {RootState} from '../../../store/reducers';
import {fetchFromTabletErrorsApi, TabletErrorsApi} from '../../../../shared/tablet-errors-manager';
import {getCluster} from '../../../store/selectors/global';
import {tabletErrorsByBundleActions} from '../../../store/reducers/tablet-errors/tablet-errors-by-bundle';
import CancelHelper from '../../../utils/cancel-helper';

type AsyncAction<T = Promise<void>> = ThunkAction<T, RootState, unknown, any>;

const cancelHelper = new CancelHelper();

export function loadTabletErrorsByBundle(
    page: number,
    params: Pick<
        TabletErrorsApi['tablet_errors_by_bundle']['body'],
        'tablet_cell_bundle' | 'start_timestamp' | 'end_timestamp' | 'methods'
    >,
): AsyncAction {
    return (dispatch, getState) => {
        dispatch(tabletErrorsByBundleActions.onRequest({bundle: params.tablet_cell_bundle}));

        const state = getState();
        const cluster = getCluster(state);

        return fetchFromTabletErrorsApi(
            'tablet_errors_by_bundle',
            cluster,
            {
                ...params,
                offset: page * 100,
                count_limit: 100,
            },
            cancelHelper.removeAllAndGenerateNextToken(),
        ).then(({data}) => {
            dispatch(tabletErrorsByBundleActions.onSuccess({data}));
        });
    };
}

export function updateTimeRange(from: number, to: number): AsyncAction<void> {
    return (dispatch) => {
        dispatch(tabletErrorsByBundleActions.updateFilter({timeRangeFilter: {from, to}}));
    };
}
