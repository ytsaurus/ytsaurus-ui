import {type ThunkAction} from 'redux-thunk';
import {type NodeType} from '../../../../shared/constants/system';
import {setSettingSystemNodesNodeType} from '../settings/settings';
import {type RootState} from '../../../store/reducers';

export function setSysmetNodesNodeType(
    value: Array<NodeType>,
): ThunkAction<void, RootState, unknown, any> {
    return (dispatch) => {
        dispatch(setSettingSystemNodesNodeType(value));
    };
}
