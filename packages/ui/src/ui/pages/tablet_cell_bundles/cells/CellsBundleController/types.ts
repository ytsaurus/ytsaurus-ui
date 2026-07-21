import {type BundleInstance} from '../../../../store/reducers/tablet_cell_bundles';
import {type OrderType} from '../../../../utils/sort-helpers';
import {type SortState} from '../../../../types';

export type RowData = BundleInstance;

export type ColumnRenderProps<T> = {
    value?: unknown;
    row: T;
    index: number;
    footer?: boolean;
    headerData?: boolean;
};

type SortColumn = keyof BundleInstance;

export type ColumnsParams = {
    sortState?: SortState<SortColumn>;
    onSortChange?: (column: SortColumn, order: OrderType) => void;
};
