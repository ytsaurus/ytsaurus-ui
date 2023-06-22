import {ThunkAction} from 'redux-thunk';

import {RootState} from '../../../store/reducers';

import {setSetting} from './index';

// @ts-ignore
import {NAMESPACES, SettingName} from '../../../../shared/constants/settings';
import {AnnotationVisibilityType} from '../../../../shared/constants/settings-ts';
import {AccountUsageViewType} from '../../../store/reducers/accounts/usage/accounts-usage-filters';

type SettingThunkAction = ThunkAction<any, RootState, any, any>;

export function setTableDisplayRawStrings(value: boolean): SettingThunkAction {
    return (dispatch) => {
        dispatch(
            setSetting(
                SettingName.NAVIGATION.TABLE_DISPLAY_RAW_STRINGS,
                NAMESPACES.NAVIGATION,
                value,
            ),
        );
    };
}

export function setSettingAnnotationVisibility(
    value: AnnotationVisibilityType,
): SettingThunkAction {
    return (dispatch) => {
        dispatch(
            setSetting(SettingName.NAVIGATION.ANNOTATION_VISIBILITY, NAMESPACES.NAVIGATION, value),
        );
    };
}

// YTFRONT-3327-column-button
export function setSettingsNavigationQueuePartitionsVisibility(
    value: Array<string>,
): SettingThunkAction {
    return (dispatch) => {
        dispatch(
            setSetting(
                SettingName.NAVIGATION.QUEUE_PARTITIONS_VISIBILITY,
                NAMESPACES.NAVIGATION,
                value,
            ),
        );
    };
}

// YTFRONT-3327-column-button
export function setSettingsNavigationQueueConsumersVisibility(
    value: Array<string>,
): SettingThunkAction {
    return (dispatch) => {
        dispatch(
            setSetting(
                SettingName.NAVIGATION.QUEUE_CONSUMERS_VISIBILITY,
                NAMESPACES.NAVIGATION,
                value,
            ),
        );
    };
}

// YTFRONT-3327-column-button
export function setSettingsNavigationConsumerPartitionsVisibility(
    value: Array<string>,
): SettingThunkAction {
    return (dispatch) => {
        dispatch(
            setSetting(
                SettingName.NAVIGATION.CONSUMER_PARTITIONS_VISIBILITY,
                NAMESPACES.NAVIGATION,
                value,
            ),
        );
    };
}

export function setSettingsPagesOrder(order: Array<string>): SettingThunkAction {
    return (dispatch) => {
        dispatch(setSetting(SettingName.GLOBAL.PAGES_ORDER, NAMESPACES.GLOBAL, order));
    };
}

export function setSettingsPagesPinned(pinned: Record<string, boolean>): SettingThunkAction {
    return (dispatch) => {
        dispatch(setSetting(SettingName.GLOBAL.PAGES_PINNED, NAMESPACES.GLOBAL, pinned));
    };
}

export function setSettingsSchedulingExpandStaticConfiguration(
    expand: boolean,
): SettingThunkAction {
    return (dispatch) => {
        dispatch(
            setSetting(
                SettingName.SCHEDULING.EXPAND_STATIC_CONFIGURATION,
                NAMESPACES.SCHEDULING,
                expand,
            ),
        );
    };
}

export function setSettingsAccountsExpandStaticConfiguration(expand: boolean): SettingThunkAction {
    return (dispatch) => {
        dispatch(
            setSetting(
                SettingName.ACCOUNTS.EXPAND_STATIC_CONFIGURATION,
                NAMESPACES.ACCOUNTS,
                expand,
            ),
        );
    };
}

export function setSettingsSystemMastersCollapsed(value: boolean): SettingThunkAction {
    return (dispatch) => {
        dispatch(setSetting(SettingName.SYSTEM.MASTERS_COLLAPSED, NAMESPACES.SYSTEM, value));
    };
}

export function setSettingsSystemSchedulersCollapsed(value: boolean): SettingThunkAction {
    return (dispatch) => {
        dispatch(setSetting(SettingName.SYSTEM.SCHEDULERS_COLLAPSED, NAMESPACES.SYSTEM, value));
    };
}

export function setSettingsSystemChunksCollapsed(value: boolean): SettingThunkAction {
    return (dispatch) => {
        dispatch(setSetting(SettingName.SYSTEM.CHUNKS_COLLAPSED, NAMESPACES.SYSTEM, value));
    };
}

export function setSettingsSystemRpcProxiesCollapsed(value: boolean): SettingThunkAction {
    return (dispatch) => {
        dispatch(setSetting(SettingName.SYSTEM.RPC_PROXIES_COLLAPSED, NAMESPACES.SYSTEM, value));
    };
}

export function setSettingsSystemHttpProxiesCollapsed(value: boolean): SettingThunkAction {
    return (dispatch) => {
        dispatch(setSetting(SettingName.SYSTEM.HTTP_PROXIES_COLLAPSED, NAMESPACES.SYSTEM, value));
    };
}

export function setSettingsSystemNodesCollapsed(value: boolean): SettingThunkAction {
    return (dispatch) => {
        dispatch(setSetting(SettingName.SYSTEM.NODES_COLLAPSED, NAMESPACES.SYSTEM, value));
    };
}
export function setSettingsAccountUsageViewType(value: AccountUsageViewType): SettingThunkAction {
    return (dispatch) => {
        dispatch(
            setSetting(SettingName.ACCOUNTS.ACCOUNTS_USAGE_VIEW_TYPE, NAMESPACES.ACCOUNTS, value),
        );
    };
}

export function setSettingsAccountUsageColumnsTree(value: Array<string>): SettingThunkAction {
    return (dispatch) => {
        dispatch(
            setSetting(
                SettingName.ACCOUNTS.ACCOUNTS_USAGE_COLUMNS_TREE,
                NAMESPACES.ACCOUNTS,
                value,
            ),
        );
    };
}

export function setSettingsAccountUsageColumnsList(value: Array<string>): SettingThunkAction {
    return (dispatch) => {
        dispatch(
            setSetting(
                SettingName.ACCOUNTS.ACCOUNTS_USAGE_COLUMNS_LIST,
                NAMESPACES.ACCOUNTS,
                value,
            ),
        );
    };
}

export function setSettingsAccountUsageColumnsListFolders(
    value: Array<string>,
): SettingThunkAction {
    return (dispatch) => {
        dispatch(
            setSetting(
                SettingName.ACCOUNTS.ACCOUNTS_USAGE_COLUMNS_LIST_FOLDERS,
                NAMESPACES.ACCOUNTS,
                value,
            ),
        );
    };
}

export type ActiveJobTypesMap<OperationType extends string = string, JobType = string> = Record<
    OperationType,
    JobType
>;

export function setSettingsStatisticsActiveJobTypes(value: ActiveJobTypesMap): SettingThunkAction {
    return (dispatch) => {
        dispatch(
            setSetting(
                SettingName.OPERATIONS.STATISTICS_ACTIVE_JOB_TYPES,
                NAMESPACES.OPERATION,
                value,
            ),
        );
    };
}

export function setSettingNavigationPanelExpanded(expanded: boolean): SettingThunkAction {
    return (dispatch) => {
        dispatch(
            setSetting(SettingName.GLOBAL.NAVIGATION_PANEL_EXPAND, NAMESPACES.GLOBAL, expanded),
        );
    };
}

export function setSettingSystemNodesNodeType(nodeType: Array<string>): SettingThunkAction {
    return (dispatch) => {
        dispatch(
            setSetting(SettingName.SYSTEM.NODES_NODE_TYPE, NAMESPACES.SYSTEM, nodeType.join(',')),
        );
    };
}
