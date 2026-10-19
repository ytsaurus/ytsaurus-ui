import {useMemo} from 'react';

import {useAccountEditorTreeQuery, useAccountPathQuery} from '../../../store/api/accounts';
import {type AccountTreeYsonNode, accountPathToTopLevel} from './accountTreeYsonToList';
import {prepareAccountEditorData} from './prepareAccountEditorData';

export function useAccountEditorData({
    cluster,
    accountName,
    openedAt,
    skip,
}: {
    cluster: string;
    accountName: string;
    openedAt: number;
    skip?: boolean;
}) {
    const pathQuery = useAccountPathQuery({cluster, accountName}, {skip});
    const topLevel = pathQuery.currentData
        ? accountPathToTopLevel(pathQuery.currentData)
        : undefined;
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
        // A new opening must not consume the previous attempt's cached error.
        error:
            ((pathQuery.startedTimeStamp ?? 0) >= openedAt && pathQuery.error) ||
            ((treeQuery.startedTimeStamp ?? 0) >= openedAt && treeQuery.error),
        isFetching: pathQuery.isFetching || treeQuery.isFetching,
        isLoading: pathQuery.isLoading || Boolean(topLevel && treeQuery.isLoading),
    };
}
