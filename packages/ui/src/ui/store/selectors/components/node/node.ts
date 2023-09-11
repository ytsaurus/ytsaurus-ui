import type {RootState} from '../../../../store/reducers';

export const nodeSelector = (state: RootState) => state.components.node.node;

export const nodeHostSelector = (state: RootState) => nodeSelector(state).node?.host;

export const getNodeAlertCount = (state: RootState) => state.components.node.node.node?.alertCount;

export const getNodeAlerts = (state: RootState) => state.components.node.node.node?.alerts;
