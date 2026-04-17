import {useSelector} from '../../../../../../store/redux-hooks';

import {RootState} from '../../../../../../store/reducers';
import {useAccountsQuery} from '../../../../../../store/api/dashboard2/accounts';
import {
    selectAccountsList,
    selectAccountsTypeFilter,
} from '../../../../../../store/selectors/dashboard2/accounts';
import {selectCluster} from '../../../../../../store/selectors/global';
import {selectIsAdmin} from '../../../../../../store/selectors/global/is-developer';
import {useUsableAccountsQuery} from '../../../../../../store/api/accounts';

import {AccountsWidgetProps} from '../types';

export function useAccountsWidget(props: AccountsWidgetProps) {
    const {data} = props;

    const cluster = useSelector(selectCluster);
    const type = useSelector((state: RootState) => selectAccountsTypeFilter(state, props.id));
    const isAdmin = useSelector(selectIsAdmin);

    const {isLoading: isUsableLoading, isFetching: isUsableFetching} = useUsableAccountsQuery(
        {cluster},
        {skip: isAdmin},
    );

    const accountsList = useSelector((state: RootState) =>
        selectAccountsList(state, props.id, data?.accounts || []),
    );

    const {
        data: accounts,
        isLoading,
        isFetching,
        error,
    } = useAccountsQuery({
        id: props.id,
        accountsList,
        cluster,
        medium: data?.columns
            ? data.columns
                  .map((item) => item.name)
                  .filter((item) => !['Nodes', 'Chunks'].includes(item))
            : undefined,
    });

    return {
        accounts,
        isLoading: isLoading || isFetching || isUsableFetching || isUsableLoading,
        error,
        type,
        userColumns: data?.columns,
    };
}
