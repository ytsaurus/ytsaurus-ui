import {ThunkAction} from 'redux-thunk';
import {CREATE_ACO_MODAL} from '../../../../constants/navigation/modals';
import {CreateACOModalAction} from '../../../../store/reducers/navigation/modals/create-aco';
import {RootState} from '../../../reducers';
import {ytApiV3} from '../../../../rum/rum-wrap-api';
import {updateView} from '../index';
import {toaster} from '../../../../utils/toaster';

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

export function createACO(params: CreateACOActionParams): CreateAcoModalThunkAction {
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

                toaster.add({
                    name: 'create-aco',
                    theme: 'success',
                    title: 'ACO created',
                    content: '',
                });
            });
    };
}
