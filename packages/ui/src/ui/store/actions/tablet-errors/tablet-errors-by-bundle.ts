import {ThunkAction} from 'redux-thunk';
import {RootState} from '../../../store/reducers';
import axios, {AxiosResponse} from 'axios';
import {TabletErrorsApi} from '../../../../shared/tablet-errors-manager';
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

        return axios
            .post<
                TabletErrorsApi['tablet_errors_by_bundle']['response'],
                AxiosResponse<TabletErrorsApi['tablet_errors_by_bundle']['response']>,
                TabletErrorsApi['tablet_errors_by_bundle']['body']
            >(`/api/tablet-errors/${cluster}/tablet_errors_by_bundle`, {...params, cluster, count_limit: 100, offset: page * 100}, {cancelToken: cancelHelper.removeAllAndGenerateNextToken()})
            .then(({data}) => {
                dispatch(tabletErrorsByBundleActions.onSuccess({data}));
            });
    };
}

export function updateTimeRange(from: number, to: number): AsyncAction<void> {
    return (dispatch) => {
        dispatch(tabletErrorsByBundleActions.updateFilter({timeRangeFilter: {from, to}}));
    };
}
