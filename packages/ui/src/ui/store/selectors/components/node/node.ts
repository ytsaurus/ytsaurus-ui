import type {RootState} from '../../../../store/reducers/index';

export const selectNode = (state: RootState) => state.components.node.node;

export const selectNodeHost = (state: RootState) => selectNode(state).node?.host;

export const selectNodeAlertCount = (state: RootState) =>
    state.components.node.node.node?.alertCount;

export const selectNodeAlerts = (state: RootState) => state.components.node.node.node?.alerts;
