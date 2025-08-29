import {QueryToken} from '../../../../shared/constants/settings-types';

export type TokenFormState = {
    token: QueryToken;
    errors: {
        name: string;
        cluster: string;
        path: string;
    };
    loading: boolean;
};

export type TokenFormAction =
    | {type: 'SET_NAME'; payload: string}
    | {type: 'SET_CLUSTER'; payload: string}
    | {type: 'SET_PATH'; payload: string}
    | {type: 'SET_ERRORS'; payload: TokenFormState['errors']}
    | {type: 'SET_LOADING'; payload: boolean}
    | {type: 'RESET_FORM'; payload?: undefined};

export const initialState: TokenFormState = {
    token: {name: '', cluster: '', path: ''},
    errors: {name: '', cluster: '', path: ''},
    loading: false,
};

export const tokenFormReducer = (
    state: TokenFormState,
    action: TokenFormAction,
): TokenFormState => {
    switch (action.type) {
        case 'SET_NAME':
            return {
                ...state,
                token: {...state.token, name: action.payload},
                errors: {...state.errors, name: ''},
            };
        case 'SET_CLUSTER':
            return {
                ...state,
                token: {...state.token, cluster: action.payload},
                errors: {...state.errors, cluster: ''},
            };
        case 'SET_PATH':
            return {
                ...state,
                token: {...state.token, path: action.payload},
                errors: {...state.errors, path: ''},
            };
        case 'SET_ERRORS':
            return {
                ...state,
                errors: action.payload,
            };
        case 'SET_LOADING':
            return {
                ...state,
                loading: action.payload,
            };
        case 'RESET_FORM':
            return initialState;
        default:
            return state;
    }
};
