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

import {AccountsWidgetProps} from '../types';

export function useAccountsWidget(props: AccountsWidgetProps) {
    const {data} = props;

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
        medium: data?.columns
            ? data.columns
                  .map((item) => item.name)
                  .filter((item) => !['Nodes', 'Chunks'].includes(item))
            : undefined,
    });

    return {
        accounts,
        isLoading: isLoading || isFetching,
        error,
        type,
        userColumns: data?.columns,
    };
}
