import {type AnyAction} from 'redux';
import {type ThunkAction} from 'redux-thunk';
import {type AxiosError} from 'axios';
import isEqual_ from 'lodash/isEqual';
import {YTApiId, ytApiV4Id} from '../../../rum/rum-wrap-api';
import {
    selectEffectiveApiStage,
    selectQueryId,
    selectQueryTrackerRequestOptions,
} from '../../selectors/query-tracker/query';
import {showErrorPopup} from '../../../utils/utils';
import {QUERY_ACO_LOADING, type QueryACOActions} from '../../reducers/query-tracker/queryAco';
import {type RootState} from '../../reducers';
import {selectSpytDefaultSettings} from '../../selectors/query-tracker/queryTrackerEnginesInfo';
import {setSettingByKey} from '../settings';
import {toaster} from '../../../utils/toaster';
import {mergeSpytDefaultSettingsIntoDraft} from './query';

type QueryTrackerInfoResponse = Awaited<ReturnType<typeof ytApiV4Id.getQueryTrackerInfo>>;

export const getQueryTrackerInfo = (): ThunkAction<
    Promise<QueryTrackerInfoResponse>,
    any,
    any,
    QueryACOActions
> => {
    return (dispatch, getState) => {
        const state = getState();
        const {stage} = selectQueryTrackerRequestOptions(state);

        dispatch({type: QUERY_ACO_LOADING.REQUEST});

        return ytApiV4Id
            .getQueryTrackerInfo(YTApiId.getQueryTrackerInfo, {
                setup: {
                    transformError({
                        parsedData,
                        rawError,
                    }: {
                        parsedData: Awaited<ReturnType<typeof ytApiV4Id.getQueryTrackerInfo>>;
                        rawError: AxiosError;
                    }) {
                        if (rawError?.response?.status === 404) {
                            throw {
                                data: parsedData,
                                status: rawError?.response?.status,
                            };
                        }

                        throw parsedData;
                    },
                },
                parameters: {stage},
            })
            .then((data) => {
                const stateBefore = getState();
                const prevDefaults = selectSpytDefaultSettings(stateBefore);
                const prevKeyCount = Object.keys(prevDefaults).length;

                dispatch({
                    type: QUERY_ACO_LOADING.SUCCESS,
                    data: {data},
                });

                const nextDefaults = data?.engines_info?.spyt?.default_settings || {};
                const nextKeyCount = Object.keys(nextDefaults).length;
                const defaultsChanged =
                    nextKeyCount > 0 &&
                    (prevKeyCount === 0 || !isEqual_(prevDefaults, nextDefaults));

                const isNewDraft = !selectQueryId(getState());
                if (defaultsChanged && isNewDraft) {
                    dispatch(mergeSpytDefaultSettingsIntoDraft());
                }

                return data;
            })
            .catch((error) => {
                // @todo Remove the condition when the method will be implemented on all clusters
                if (error?.status !== 404) {
                    toaster.add({
                        name: 'aco',
                        theme: 'danger',
                        title: 'Failed to load ACO',
                        content: error?.message,
                        actions: [{label: ' Details', onClick: () => showErrorPopup(error)}],
                    });
                }

                dispatch({
                    type: QUERY_ACO_LOADING.FAILURE,
                });
            });
    };
};

export function setUserDefaultACO(
    aco: string,
): ThunkAction<Promise<any>, RootState, any, AnyAction> {
    return async (dispatch, getState) => {
        const state = getState();
        const stage = selectEffectiveApiStage(state);

        await dispatch(setSettingByKey(`qt-stage::${stage}::queryTracker::defaultACO`, aco));
    };
}
