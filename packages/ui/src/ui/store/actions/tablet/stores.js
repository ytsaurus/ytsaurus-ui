import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import map_ from 'lodash/map';

import {splitBatchResults} from '../../../../shared/utils/error';

import CancelHelper from '../../../utils/cancel-helper';
import {TYPED_OUTPUT_FORMAT} from '../../../constants/index';
import {LOAD_STORES} from '../../../constants/tablet';
import {preparePath, prepareStores} from '../../../utils/tablet/stores';
import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';

const requests = new CancelHelper();

export function loadStoresData(storesId, index, unorderedDynamicTable) {
    return (dispatch, getState) => {
        dispatch({type: LOAD_STORES.REQUEST});

        const {tabletPath} = getState().tablet.tablet;

        const requests = map_(storesId, (storeId) => {
            const path = unorderedDynamicTable
                ? tabletPath + '/stores/' + storeId
                : preparePath(tabletPath, index, storeId);
            return {
                command: 'get',
                parameters: {
                    path,
                },
            };
        });

        return ytApiV3Id
            .executeBatch(YTApiId.tabletStoresByIds, {
                parameters: {requests, output_format: TYPED_OUTPUT_FORMAT},
            })
            .then((data) => {
                const {error, results} = splitBatchResults(data, 'Failed to fetch stores');
                if (error) {
                    return Promise.reject(error);
                }
                dispatch({
                    type: LOAD_STORES.SUCCESS,
                    data: {
                        stores: prepareStores(results, storesId),
                    },
                });
            })
            .catch((error) => {
                if (error.code !== yt.codes.CANCELLED) {
                    dispatch({
                        type: LOAD_STORES.FAILURE,
                        data: {error},
                    });
                }
            });
    };
}

export function abortAndReset() {
    return (dispatch) => {
        requests.removeAllRequests();
        dispatch({type: LOAD_STORES.CANCELLED});
    };
}
