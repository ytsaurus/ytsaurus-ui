import {YTApiId} from '../../../../rum/rum-wrap-api';
import {useGetQuery} from '../../../../store/api/yt/get';

export function useAccountMonitoringAttribute(
    cluster: string,
    account: string,
    attributePath: string,
) {
    const query = useGetQuery<Record<string, number>>(
        {
            id: YTApiId.accountsData,
            cluster,
            parameters: {path: `//sys/accounts/${account}/@${attributePath}`},
        },
        {skip: !cluster || !account},
    );

    return {...query, data: query.currentData};
}
