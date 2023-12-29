import {Action} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {Toaster} from '@gravity-ui/uikit';
import {CREATE_ACO_MODAL} from '../../../../constants/navigation/modals';
import {CreateACOModalAction} from '../../../../store/reducers/navigation/modals/create-aco';
import {RootState} from '../../../reducers';
import {ytApiV3} from '../../../../rum/rum-wrap-api';
import {updateView} from '../index';

type CreateAcoModalThunkAction<R = any> = ThunkAction<R, RootState, unknown, CreateACOModalAction>;

export function openCreateACOModal(
    params: {path?: string; namespace?: string} = {},
): CreateAcoModalThunkAction {
    return (dispatch) => {
        dispatch({
            type: CREATE_ACO_MODAL,
            data: {...params, visible: true},
        });
    };
}

export function closeCreateACOModal(): CreateAcoModalThunkAction {
    return (dispatch) => {
        dispatch({
            type: CREATE_ACO_MODAL,
            data: {path: undefined, target: undefined, visible: false},
        });
    };
}

type CreateACOActionParams = {path: string; name: string; namespace: string};

export function createACO(
    params: CreateACOActionParams,
): ThunkAction<Promise<unknown>, RootState, unknown, Action<unknown>> {
    return (dispatch) => {
        const {path, name, namespace} = params;

        return ytApiV3
            .create({
                path,
                type: 'access_control_object',
                attributes: {name, namespace},
            })
            .then(() => {
                dispatch(closeCreateACOModal());
                dispatch(updateView());

                const toast = new Toaster();

                toast.add({
                    name: 'create-aco',
                    type: 'success',
                    title: 'ACO created',
                    content: '',
                });
            });
    };
}
