import {ThunkAction} from 'redux-thunk';
import {NodeType} from '../../../../shared/constants/system';
import {setSettingSystemNodesNodeType} from '../settings/settings';
import {RootState} from '../../../store/reducers';
import {loadNodes} from './nodes';

export function setSysmetNodesNodeType(
    value: Array<NodeType>,
): ThunkAction<void, RootState, unknown, any> {
    return (dispatch) => {
        dispatch(setSettingSystemNodesNodeType(value));

        dispatch(loadNodes());
    };
}
