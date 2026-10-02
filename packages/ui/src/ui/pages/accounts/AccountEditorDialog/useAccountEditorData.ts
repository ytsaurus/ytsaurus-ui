import {useMemo} from 'react';

import {useAccountEditorPathQuery, useAccountEditorTreeQuery} from '../../../store/api/accounts';
import {type AccountTreeYsonNode, accountPathToTopLevel} from './accountTreeYsonToList';
import {prepareAccountEditorData} from './prepareAccountEditorData';

export function useAccountEditorData({
    cluster,
    accountName,
    skip,
}: {
    cluster: string;
    accountName: string;
    skip?: boolean;
}) {
    const pathQuery = useAccountEditorPathQuery({cluster, accountName}, {skip});
    const topLevel = accountPathToTopLevel(pathQuery.currentData);
    const treeQuery = useAccountEditorTreeQuery<AccountTreeYsonNode>(
        {cluster, topLevel: topLevel || ''},
        {skip: skip || !topLevel},
    );
    const data = useMemo(() => {
        return topLevel && treeQuery.currentData
            ? prepareAccountEditorData(topLevel, treeQuery.currentData)
            : undefined;
    }, [topLevel, treeQuery.currentData]);

    return {
        data,
        topLevel,
        error: pathQuery.error || treeQuery.error,
        isFetching: pathQuery.isFetching || treeQuery.isFetching,
        isLoading: pathQuery.isLoading || Boolean(topLevel && treeQuery.isLoading),
    };
}
