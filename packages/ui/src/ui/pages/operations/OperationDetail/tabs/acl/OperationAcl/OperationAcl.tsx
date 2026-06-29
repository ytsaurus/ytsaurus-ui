import React from 'react';
import {YTError} from '../../../../../../../@types/types';
import {PermissionsRow} from '../../../../../../containers/ACL/ACL-types';
import {AclTableWithToolbar} from '../../../../../../containers/ACL/AclTableWithToolbar/AclTableWithToolbar';
import {useAclColumns} from '../../../../../../containers/ACL/hooks/use-acl-columns/use-acl-columns';
import {YTErrorBlock} from '../../../../../../containers/Block/Block';
import {useMemoizedIfEqual} from '../../../../../../hooks';
import {useSelector} from '../../../../../../store/redux-hooks';
import {selectOperationAcl} from '../../../../../../store/selectors/operations/operation-acl';
import {splitSubjects} from '../../../../../../utils/acl';
import {internalAclWithTypes} from '../../../../../../utils/acl/acl-api';

export function OperationAcl() {
    const {items = [], loading, error} = useOperationAcl();

    const columns = useAclColumns(['subjects', 'permissions', 'actions'], {
        renderRoleActions: () => null,
    });

    return error ? (
        <YTErrorBlock error={error} />
    ) : (
        <AclTableWithToolbar
            title={'Operation permissions'}
            noItemsText={'No data to display'}
            items={items}
            loading={loading}
            loaded={!loading}
            columns={columns}
            toolbar={<div />}
        />
    );
}

function useOperationAcl() {
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
        internalAclWithTypes(splitSubjects(aclMemo)).then(
            (items) => {
                setResult({items});
            },
            (error) => {
                setResult({error});
            },
        );
    }, [aclMemo]);

    return result;
}
