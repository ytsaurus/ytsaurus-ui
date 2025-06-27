import {PluginWidgetProps} from '@gravity-ui/dashkit';
import {useSelector} from 'react-redux';

import {RootState} from '../../../../../../store/reducers';
import {useAccountsQuery} from '../../../../../../store/api/dashboard2/accounts';
import {
    getAccountsList,
    getAccountsTypeFilter,
} from '../../../../../../store/selectors/dashboard2/accounts';
import {getCluster} from '../../../../../../store/selectors/global';
import {isDeveloper} from '../../../../../../store/selectors/global/is-developer';
import {useUsableAccountsQuery} from '../../../../../../store/api/accounts';

import {ColumnSortByInfo} from '../../../../../navigation/modals/TableMergeSortModal/TableSortByControl';

export type AccountsWidgetData = {
    accounts?: string[];
    disk_columns?: ColumnSortByInfo[];
    columns?: ColumnSortByInfo[];
};

export function useAccountsWidget(props: PluginWidgetProps) {
    const {data}: {data: AccountsWidgetData & PluginWidgetProps['data']} = props;

    const cluster = useSelector(getCluster);
    const type = useSelector((state: RootState) => getAccountsTypeFilter(state, props.id));
    const isAdmin = useSelector(isDeveloper);

    useUsableAccountsQuery({cluster}, {skip: isAdmin});

    const accountsList = useSelector((state: RootState) =>
        getAccountsList(state, props.id, data?.accounts || []),
    );

    const {
        data: accounts,
        isLoading,
        isFetching,
        error,
    } = useAccountsQuery({
        id: props.id,
        accountsList,
        medium: data?.disk_columns ? data.disk_columns.map((item) => item.name) : undefined,
    });

    return {
        accounts,
        isLoading: isLoading || isFetching,
        error,
        type,
        diskColumns: data?.disk_columns,
        baseColumns: data?.columns,
    };
}
