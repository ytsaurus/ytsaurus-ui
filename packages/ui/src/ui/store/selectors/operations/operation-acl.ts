import {type RootState} from '../../../store/reducers';

export const selectOperationAcl = (state: RootState) => {
    return state.operations.detail.operation?.getAcl() ?? [];
};
