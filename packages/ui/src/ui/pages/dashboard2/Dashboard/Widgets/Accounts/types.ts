import {PluginWidgetProps} from '@gravity-ui/dashkit/build/esm';
import {ColumnSortByInfo} from '../../../../../pages/navigation/modals/TableMergeSortModal/TableSortByControl';

export type AccountsWidgetData = {
    accounts?: string[];
    disk_columns?: ColumnSortByInfo[];
    columns?: ColumnSortByInfo[];
    name?: string;
};

export type AccountsWidgetProps = PluginWidgetProps & {
    data?: AccountsWidgetData;
};
