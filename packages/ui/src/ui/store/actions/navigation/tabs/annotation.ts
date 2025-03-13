// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import {
    SET_ANNOTATION_EDITING,
    SET_ANNOTATION_SAVING,
} from '../../../../constants/navigation/tabs/annotation';
import {wrapApiPromiseByToaster} from '../../../../utils/utils';
import {ThunkAction} from 'redux-thunk';
import {RootState} from '../../../reducers';
import {NavigationTabsAnnotationAction} from '../../../reducers/navigation/tabs/annotation';
import {getNavigationAnnotation} from '../../../selectors/navigation/tabs/annotation';

type TabletErrorsThunkAction = ThunkAction<any, RootState, unknown, NavigationTabsAnnotationAction>;

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
