// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import CancelHelper from '../../../../utils/cancel-helper';
import {getPath} from '../../../selectors/navigation';
import {
    GET_DOCUMENT,
    SET_DOCUMENT_EDIT_MODE,
} from '../../../../constants/navigation/content/document';
import {YTApiId, ytApiV3Id} from '../../../../rum/rum-wrap-api';
import {ThunkAction} from 'redux-thunk';
import {RootState} from '../../../reducers';
import {NavigationDocumentAction} from '../../../reducers/navigation/content/document';
import {wrapApiPromiseByToaster} from '../../../../utils/utils';

const requests = new CancelHelper();

type DocumentThunkAction = ThunkAction<void, RootState, any, NavigationDocumentAction>;

export const getDocument = (): DocumentThunkAction => (dispatch, getState) => {
    const state = getState();
    const path = getPath(state) as string;

    dispatch({type: GET_DOCUMENT.REQUEST});
    requests.removeAllRequests();

    return ytApiV3Id
        .get(YTApiId.navigationGetDocument, {
            parameters: {
                path,
                output_format: {$value: 'json', $attributes: {}},
            },
            cancellation: requests.saveCancelToken,
        })
        .then((document) => {
            dispatch({
                type: GET_DOCUMENT.SUCCESS,
                data: {document},
            });
        })
        .catch((error) => {
            if (error.code === yt.codes.CANCELLED) {
                dispatch({type: GET_DOCUMENT.CANCELLED});
            } else {
                dispatch({
                    type: GET_DOCUMENT.FAILURE,
                    data: {error},
                });
            }
        });
};

export const saveDocument =
    ({path, documentString}: {path: string; documentString: string}): DocumentThunkAction =>
    async (dispatch) => {
        const document = documentString === '' ? null : JSON.parse(documentString);
        try {
            await wrapApiPromiseByToaster(yt.v3.set({path}, document), {
                toasterName: 'navigation-save-document',
                errorTitle: 'Failed to save document',
                successTitle: 'Document successfully saved',
            });

            dispatch({type: SET_DOCUMENT_EDIT_MODE, data: false});
            dispatch({
                type: GET_DOCUMENT.SUCCESS,
                data: {document: document},
            });

            return Promise.resolve();
        } catch (e) {
            return Promise.reject(e);
        }
    };

export const abortAndReset = (): DocumentThunkAction => (dispatch) => {
    requests.removeAllRequests();
    dispatch({type: GET_DOCUMENT.CANCELLED});
};
