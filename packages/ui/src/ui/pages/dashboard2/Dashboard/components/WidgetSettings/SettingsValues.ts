import {ConfigItemData} from '@gravity-ui/dashkit';
import type {AccountsWidgetData} from '../../Widgets/Accounts/types';
import {OperationsSettingsValues} from '../../Widgets/Operations/settings';
import {PoolsSettingsValues} from '../../Widgets/Pools/settings';
import {QueriesSettingsValues} from '../../Widgets/Queries/settings';
import {ServicesSettingsValues} from '../../Widgets/Services/settings';
import type {NavigationWidgetData} from '../../Widgets/Navigation/types';
import {AccountsWidgetData} from '../../Widgets/Accounts/types';

export type SettingsValues =
    | AccountsWidgetData
    | NavigationWidgetData
    | OperationsSettingsValues
    | PoolsSettingsValues
    | QueriesSettingsValues
    | ServicesSettingsValues
    | ConfigItemData;
