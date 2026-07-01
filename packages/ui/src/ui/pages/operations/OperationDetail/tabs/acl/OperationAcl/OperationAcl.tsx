import React from 'react';
import {type YTError} from '../../../../../../../@types/types';
import {type PermissionsRow} from '../../../../../../containers/ACL/ACL-types';
import {AclTableWithToolbar} from '../../../../../../containers/ACL/AclTableWithToolbar/AclTableWithToolbar';
import {useAclColumns} from '../../../../../../containers/ACL/hooks/use-acl-columns/use-acl-columns';
import {YTErrorBlock} from '../../../../../../containers/Block/Block';
import {useMemoizedIfEqual} from '../../../../../../hooks';
import {
    getPermissionsFilter,
    getSubjectFilter,
} from '../../../../../../store/reducers/operations/acl-filters';
import {useSelector} from '../../../../../../store/redux-hooks';
import {selectCluster} from '../../../../../../store/selectors/global/cluster';
import {selectOperationAcl} from '../../../../../../store/selectors/operations/operation-acl';
import {permissionsFilterPredicate, subjectFilterPredicate} from '../../../../../../utils/acl';
import {getOperationAclSplitted} from '../../../../../../utils/acl/acl-operation';
import {OperationAclDeleteButton} from './OperationAclDeleteButton/OperationAclDeleteButton';
import {OperationAclToolbar} from './OperationAclToolbar/OperationAclToolbar';

export function OperationAcl() {
    const {items = [], loading, error, noItemsText} = useOperationAcl();

    const columns = useAclColumns(['subjects', 'permissions', 'actions'], {
        renderRoleActions: ({row}) => <OperationAclDeleteButton row={row} />,
    });

    return error ? (
        <YTErrorBlock error={error} />
    ) : (
        <AclTableWithToolbar
            title={'Operation permissions'}
            noItemsText={noItemsText ?? 'No data to display'}
            items={items}
            loading={loading}
            loaded={!loading}
            columns={columns}
            toolbar={<OperationAclToolbar />}
        />
    );
}

function useOperationAcl() {
    const cluster = useSelector(selectCluster);
    const acl = useSelector(selectOperationAcl);

    const [aclMemo] = useMemoizedIfEqual(acl);

    const [result, setResult] = React.useState<{
        loading?: boolean;
        error?: YTError;
        items?: Array<PermissionsRow>;
    }>({loading: false});
    React.useEffect(() => {
        if (!aclMemo.length) {
            return;
        }

        setResult({loading: true});
        getOperationAclSplitted(cluster, aclMemo).then(
            (items) => {
                setResult({items});
            },
            (error) => {
                setResult({error});
            },
        );
    }, [aclMemo]);

    const items = useFilteredItems(result.items ?? []);
    const filtered = items.length < (result.items?.length ?? 0);

    return {
        ...result,
        items,
        noItemsText: filtered ? 'No data to display due to filters' : undefined,
    };
}

function useFilteredItems(items: Array<PermissionsRow>) {
    const subjectFilter = useSelector(getSubjectFilter);
    const permissionsFilter = useSelector(getPermissionsFilter);

    const predicates = React.useMemo(() => {
        const res: Array<(item: PermissionsRow) => boolean> = [];

        if (subjectFilter) {
            res.push((item) => subjectFilterPredicate(item, subjectFilter));
        }

        if (permissionsFilter.length) {
            const permissionsFilterSet = new Set(permissionsFilter);
            res.push((item) => permissionsFilterPredicate(item, permissionsFilterSet) ?? false);
        }

        return res;
    }, [subjectFilter, permissionsFilter]);

    return React.useMemo(() => {
        return items?.filter((item) => predicates.every((predicate) => predicate(item)));
    }, [items, predicates]);
}
