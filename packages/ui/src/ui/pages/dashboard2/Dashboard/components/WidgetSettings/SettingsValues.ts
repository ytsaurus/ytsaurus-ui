import {ConfigItemData} from '@gravity-ui/dashkit';

import type {AccountsWidgetData} from '../../Widgets/Accounts/types';
import type {NavigationWidgetData} from '../../Widgets/Navigation/types';
import type {OperationsWidgetData} from '../../Widgets/Operations/types';
import type {PoolsWidgetData} from '../../Widgets/Pools/types';
import type {QueriesWidgetData} from '../../Widgets/Queries/types';
import type {ServicesWidgetData} from '../../Widgets/Services/types';

export type SettingsValues =
    | AccountsWidgetData
    | NavigationWidgetData
    | OperationsWidgetData
    | PoolsWidgetData
    | QueriesWidgetData
    | ServicesWidgetData
    | ConfigItemData;
