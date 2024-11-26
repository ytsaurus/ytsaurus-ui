import {CancelTokenSource} from 'axios';

import CancelHelper, {isCancelled} from '../../../../../utils/cancel-helper';
import {getPath} from '../../../../../store/selectors/navigation';
import {GET_TABLET_ERRORS} from '../../../../../constants/navigation/tabs/tablet-errors';
import {YTApiId, ytApiV3Id, ytApiV4Id} from '../../../../../rum/rum-wrap-api';
import {ThunkAction} from 'redux-thunk';
import {RootState} from '../../../../../store/reducers';
import {
    NavigationTabletErrorsMode,
    TabletErrorsAction,
} from '../../../../../store/reducers/navigation/tabs/tablet-errors/tablet-errors-background';
import {wrapApiPromiseByToaster} from '../../../../../utils/utils';

import {loadReplicas} from '../../content/replicated-table';
import {TYPED_OUTPUT_FORMAT} from '../../../../../constants';

const requests = new CancelHelper();

type TabletErrorsThunkAction<T = unknown> = ThunkAction<T, RootState, unknown, TabletErrorsAction>;

export function getTabletErrors(): TabletErrorsThunkAction {
    return (dispatch, getState) => {
        const state = getState();
        const path = getPath(state);

        dispatch({type: GET_TABLET_ERRORS.REQUEST});

        dispatch(loadReplicas());

        ytApiV4Id
            .getTabletErrors(YTApiId.navigationTabletErrors, {
                parameters: {path, output_format: TYPED_OUTPUT_FORMAT},
                cancellation: requests.removeAllAndSave,
            })
            .then((tabletErrors) => {
                dispatch({
                    type: GET_TABLET_ERRORS.SUCCESS,
                    data: {tabletErrors, tabletErrorsPath: path},
                });
            })
            .catch((error) => {
                if (isCancelled(error)) {
                    dispatch({type: GET_TABLET_ERRORS.CANCELLED});
                } else {
                    dispatch({
                        type: GET_TABLET_ERRORS.FAILURE,
                        data: {error},
                    });
                }
            });
    };
}

interface LoadTabletErrorOptions {
    path: string;
    saveCancelTokenSource: (tokenSource: CancelTokenSource) => void;
}

export function loadTabletErrorsCount(options: LoadTabletErrorOptions): TabletErrorsThunkAction {
    const {path} = options;
    return (dispatch) => {
        return wrapApiPromiseByToaster(
            ytApiV3Id.executeBatch(YTApiId.navigationTypeDynamic, {
                parameters: {
                    requests: [
                        {
                            command: 'get',
                            parameters: {path: `${path}/@type`},
                        },
                        {
                            command: 'get',
                            parameters: {path: `${path}/@dynamic`},
                        },
                    ],
                },
                cancellation: options.saveCancelTokenSource,
            }),
            {
                toasterName: 'get_type_dynamic',
                skipSuccessToast: true,
            },
        ).then(([{output: type}, {output: dynamic}]) => {
            if (dynamic && (type === 'table' || type === 'replication_log_table')) {
                return dispatch(loadTabletErrorsCountOfDynamicTable(options));
            }

            if (type === 'replicated_table') {
                return dispatch(loadTabletErrorsCountOfReplicatedTable(options));
            }

            return undefined;
        });
    };
}

function loadTabletErrorsCountOfDynamicTable({
    path,
    saveCancelTokenSource,
}: LoadTabletErrorOptions): TabletErrorsThunkAction {
    return (dispatch) => {
        return wrapApiPromiseByToaster(
            ytApiV3Id.get(YTApiId.navigationTabletErrorsCountDynTable, {
                parameters: {
                    path: `${path}/@tablet_error_count`,
                },
                cancellation: saveCancelTokenSource,
            }),
            {
                toasterName: 'tablet_erros_count',
                skipSuccessToast: true,
            },
        ).then((errorsCount: number) => {
            dispatch(updateTabletErrrosCount(errorsCount, path));
        });
    };
}

function loadTabletErrorsCountOfReplicatedTable({
    path,
    saveCancelTokenSource,
}: LoadTabletErrorOptions): TabletErrorsThunkAction {
    return (dispatch) => {
        return wrapApiPromiseByToaster(
            ytApiV3Id.executeBatch<number>(YTApiId.navigationTabletErrorsCountReplicatedTable, {
                requests: [
                    {
                        command: 'get',
                        parameters: {
                            path: `${path}/@replicas/@error_count`,
                        },
                    },
                    {command: 'get', parameters: {path: `${path}/@tablet_error_count`}},
                ],
                cancellation: saveCancelTokenSource,
            }),
            {
                toasterName: 'tablet_errors_count',
                skipSuccessToast: true,
            },
        ).then((results) => {
            const count = results.reduce((acc, {output = 0}) => acc + output, 0);
            dispatch(updateTabletErrrosCount(count, path));
        });
    };
}

export function updateTabletErrrosCount(
    errorsCount: number,
    errorsCountPath: string,
): TabletErrorsAction {
    return {type: GET_TABLET_ERRORS.PARTITION, data: {errorsCountPath, errorsCount}};
}

export function updateTabletErrorsViewMode(viewMode: NavigationTabletErrorsMode) {
    return {type: GET_TABLET_ERRORS.PARTITION, data: {viewMode}};
}
