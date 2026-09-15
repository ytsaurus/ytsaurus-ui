import {YTApiId} from '../../rum/rum-wrap-api';
import {useGetQuery} from '../../store/api/yt/get';

export type CurrentAccountAttributes = {
    abc?: unknown;
    path?: string;
};

export function useAccountAttributes(account: string) {
    const query = useGetQuery<CurrentAccountAttributes>(
        {
            id: YTApiId.accountsData,
            parameters: {
                path: `//sys/accounts/${account}/@`,
                attributes: ['path', 'abc'],
            },
        },
        {skip: !account},
    );

    return {...query, data: query.currentData};
}
