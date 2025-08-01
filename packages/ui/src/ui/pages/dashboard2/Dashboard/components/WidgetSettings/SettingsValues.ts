import {ConfigItemData} from '@gravity-ui/dashkit';
import type {AccountsWidgetData} from '../../Widgets/Accounts/types';
import {PoolsSettingsValues} from '../../Widgets/Pools/settings';
import {QueriesSettingsValues} from '../../Widgets/Queries/settings';
import {ServicesSettingsValues} from '../../Widgets/Services/settings';
import type {NavigationWidgetData} from '../../Widgets/Navigation/types';
import type {OperationsWidgetData} from '../../Widgets/Operations/types';

export type SettingsValues =
    | AccountsWidgetData
    | NavigationWidgetData
    | OperationsWidgetData
    | PoolsSettingsValues
    | QueriesSettingsValues
    | ServicesSettingsValues
    | ConfigItemData;
