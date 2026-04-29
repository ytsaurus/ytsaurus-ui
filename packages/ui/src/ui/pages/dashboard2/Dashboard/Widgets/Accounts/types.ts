import {type PluginWidgetProps} from '@gravity-ui/dashkit';
import {type ColumnSortByInfo} from '../../../../../pages/navigation/modals/TableMergeSortModal/TableSortByControl';

export type AccountsWidgetData = {
    accounts?: string[];
    disk_columns?: ColumnSortByInfo[];
    columns?: ColumnSortByInfo[];
    name?: string;
};

export type AccountsWidgetProps = PluginWidgetProps & {
    data?: AccountsWidgetData;
};
