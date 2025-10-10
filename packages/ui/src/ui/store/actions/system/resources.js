import createActionTypes from '../../../constants/utils';
import {isRetryFutile} from '../../../utils/index';
import {showErrorPopup} from '../../../utils/utils';
import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {USE_SUPRESS_SYNC} from '../../../../shared/constants';
import {toaster} from '../../../utils/toaster';

export const FETCH_RESOURCES = createActionTypes('RESOURCES');
export const FETCH_NODE_ATTRS = createActionTypes('NODE_ATTRS');

export function loadSystemResources() {
    return (dispatch) => {
        dispatch({
            type: FETCH_RESOURCES.REQUEST,
        });
        dispatch({
            type: FETCH_NODE_ATTRS.REQUEST,
        });

        const requests = [
            {
                command: 'get',
                parameters: {
                    path: '//sys/scheduler/orchid/scheduler/cluster',
                    ...USE_SUPRESS_SYNC,
                },
            },
            {
                command: 'get',
                parameters: {
                    path: '//sys/cluster_nodes/@',
                    ...USE_SUPRESS_SYNC,
                },
            },
        ];

        return ytApiV3Id
            .executeBatch(YTApiId.systemResources, {requests})
            .then(([cluster, attrs]) => {
                if (cluster?.error) {
                    dispatch({type: FETCH_RESOURCES.FAILURE, data: cluster.error});
                    handleError(cluster.error);
                } else {
                    dispatch({
                        type: FETCH_RESOURCES.SUCCESS,
                        data: cluster.output,
                    });
                }

                if (attrs?.error) {
                    dispatch({type: FETCH_NODE_ATTRS.FAILURE, data: attrs.error});
                    handleError(attrs.error);
                } else {
                    dispatch({
                        type: FETCH_NODE_ATTRS.SUCCESS,
                        data: attrs.output,
                    });
                }

                return {
                    isRetryFutile: isRetryFutile(cluster?.error) || isRetryFutile(attrs?.error),
                };
            })
            .catch(handleError);

        function handleError(error) {
            const data = error?.response?.data || error;
            const {code, message} = data;

            toaster.add({
                name: 'load/system/resources',
                autoHiding: false,
                theme: 'danger',
                content: `[code ${code}] ${message}`,
                title: 'Could not load Resources',
                actions: [{label: ' view', onClick: () => showErrorPopup(error)}],
            });

            return {isRetryFutile: isRetryFutile(error.code)};
        }
    };
}
