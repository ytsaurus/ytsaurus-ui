// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import CancelHelper from '../../../../utils/cancel-helper';
import {prepareRequest} from '../../../../utils/navigation';
import {getPath, getTransaction} from '../../../selectors/navigation';
import {
    GET_ANNOTATION,
    SET_ANNOTATION_EDITING,
    SET_ANNOTATION_SAVING,
} from '../../../../constants/navigation/tabs/annotation';
import {YTApiId, ytApiV3Id} from '../../../../rum/rum-wrap-api';
import {getBatchError, wrapApiPromiseByToaster} from '../../../../utils/utils';
import {ThunkAction} from 'redux-thunk';
import {RootState} from '../../../reducers';
import {NavigationTabsAnnotationAction} from '../../../reducers/navigation/tabs/annotation';
import {getNavigationAnnotation} from '../../../selectors/navigation/tabs/annotation';

const cancelHelper = new CancelHelper();

type TabletErrorsThunkAction = ThunkAction<any, RootState, unknown, NavigationTabsAnnotationAction>;

export const getAnnotation = (): TabletErrorsThunkAction => (dispatch, getState) => {
    const state = getState();
    const path = getPath(state) || '';

    const transaction = getTransaction(state);

    dispatch({type: GET_ANNOTATION.REQUEST});
    cancelHelper.removeAllRequests();

    const requests = [
        {
            command: 'get' as const,
            parameters: prepareRequest('/@annotation', {
                path,
                transaction,
            }),
        },
    ];

    ytApiV3Id
        .executeBatch(YTApiId.navigationGetAnnotation, {
            parameters: {requests},
            cancellation: cancelHelper.saveCancelToken,
        })
        .then((results) => {
            const err = getBatchError(results, 'Cannot fetch annotation');
            if (yt.codes.NODE_DOES_NOT_EXIST !== results[0]?.error?.code && err) {
                throw err;
            }

            const [{output: annotation}] = results;
            dispatch({
                type: GET_ANNOTATION.SUCCESS,
                data: {annotation, path},
            });
        })
        .catch((error) => {
            if (error.code === yt.codes.CANCELLED) {
                dispatch({type: GET_ANNOTATION.CANCELLED});
            } else {
                dispatch({
                    type: GET_ANNOTATION.FAILURE,
                    data: {error, path},
                });
            }
        });
};

export const saveAnnotation =
    (path: string): TabletErrorsThunkAction =>
    async (dispatch, getState) => {
        const annotation = getNavigationAnnotation(getState());
        dispatch({type: SET_ANNOTATION_SAVING, data: true});
        wrapApiPromiseByToaster(yt.v3.set({path: `${path}/@annotation`}, annotation), {
            toasterName: 'navigation_save_annotation',
            successTitle: 'Annotation saved',
            errorTitle: 'Failed save annotation',
        })
            .then(() => {
                dispatch({type: SET_ANNOTATION_EDITING, data: false});
            })
            .finally(() => {
                dispatch({type: SET_ANNOTATION_SAVING, data: false});
            });
    };
