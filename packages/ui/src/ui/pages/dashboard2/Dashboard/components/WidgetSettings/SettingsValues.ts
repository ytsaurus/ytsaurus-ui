import {ConfigItemData} from '@gravity-ui/dashkit';
import type {AccountsWidgetData} from '../../Widgets/Accounts/types';
import {QueriesSettingsValues} from '../../Widgets/Queries/settings';
import {ServicesSettingsValues} from '../../Widgets/Services/settings';
import type {NavigationWidgetData} from '../../Widgets/Navigation/types';
import type {OperationsWidgetData} from '../../Widgets/Operations/types';
import type {PoolsWidgetData} from '../../Widgets/Pools/types';

export type SettingsValues =
    | AccountsWidgetData
    | NavigationWidgetData
    | OperationsWidgetData
    | PoolsWidgetData
    | QueriesSettingsValues
    | ServicesSettingsValues
    | ConfigItemData;
