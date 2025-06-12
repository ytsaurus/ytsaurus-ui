import {ThunkAction} from 'redux-thunk';
import isEqual_ from 'lodash/isEqual';
import omit_ from 'lodash/omit';

import {RootState} from '../../../../../store/reducers';
import {
    TabletErrorsApi,
    fetchFromTabletErrorsApi,
} from '../../../../../../shared/tablet-errors-manager';
import {ROWS_PER_PAGE} from '../../../../../constants/pagination';
import {getCluster} from '../../../../../store/selectors/global';
import {tabletErrorsByPathActions} from '../../../../../store/reducers/navigation/tabs/tablet-errors/tablet-errors-by-path';
import CancelHelper, {isCancelled} from '../../../../../utils/cancel-helper';
import {
    getTabletErrorsByPathData,
    getTabletErrorsByPathDataParams,
} from '../../../../../store/selectors/navigation/tabs/tablet-errors-by-path';

type AsyncAction<T = Promise<void>> = ThunkAction<T, RootState, unknown, any>;

const cancelHelper = new CancelHelper();

type ApiMethod = TabletErrorsApi['tablet_errors_by_table'];

export function loadTabletErrorsByTablePath(
    page: number,
    params: Pick<
        ApiMethod['body'],
        | 'table_path'
        | 'table_id'
        | 'start_timestamp'
        | 'end_timestamp'
        | 'methods'
        | 'tablet_id'
        | 'fixed_end_timestamp'
    >,
): AsyncAction {
    return (dispatch, getState) => {
        dispatch(
            tabletErrorsByPathActions.onRequest({
                table_path: params.table_path,
                table_id: params.table_id,
            }),
        );

        const state = getState();
        const cluster = getCluster(state);

        const prevDataParams = getTabletErrorsByPathDataParams(state);
        if (
            page != 0 &&
            !isEqual_(
                omit_(prevDataParams, ['fixed_end_timestamp']),
                omit_(params, ['fixed_end_timestamp']),
            )
        ) {
            page = 0;
            dispatch(tabletErrorsByPathActions.updateFilter({pageFilter: page}));
            return Promise.resolve();
        }

        const prevData = getTabletErrorsByPathData(state);
        if (page != 0 && prevData) {
            params.fixed_end_timestamp = prevData.fixed_end_timestamp;
        }

        return fetchFromTabletErrorsApi(
            'tablet_errors_by_table',
            cluster,
            {...params, offset: page * ROWS_PER_PAGE, count_limit: 100},
            cancelHelper.removeAllAndGenerateNextToken(),
        )
            .then(({data}) => {
                const payload =
                    page === 0
                        ? {
                              data,
                              dataParams: params,
                              total_row_count: data.total_row_count,
                              error_count_limit_exceeded: data?.error_count_limit_exceeded,
                          }
                        : {
                              data,
                              dataParams: params,
                              error_count_limit_exceeded: data?.error_count_limit_exceeded,
                          };

                dispatch(tabletErrorsByPathActions.onSuccess(payload));
            })
            .catch((error) => {
                if (!isCancelled(error)) {
                    dispatch(tabletErrorsByPathActions.onError({error}));
                }
            });
    };
}
