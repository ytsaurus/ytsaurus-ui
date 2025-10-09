import React from 'react';
import sortBy_ from 'lodash/sortBy';

import {Flex, Select} from '@gravity-ui/uikit';
import {useFetchBatchQuery} from '../../../store/api/yt';
import {YTApiId} from '../../../rum/rum-wrap-api';

export function MasterLocalContainers({
    allValue,
    container,
    setContainer,
}: {
    allValue: string;
    container: string;
    setContainer: (v: string) => void;
}) {
    const {data} = useFetchBatchQuery<Array<string>>({
        id: YTApiId.systemClusterMasters,
        parameters: {requests: [{command: 'list', parameters: {path: '//sys/cluster_masters'}}]},
        errorTitle: 'Failed to load masters',
    });

    const options = React.useMemo(() => {
        const res = [{value: allValue, content: allValue}];
        sortBy_(data?.[0]?.output).forEach((i) => {
            res.push({value: i, content: i});
        });
        return res;
    }, [data, allValue]);

    return (
        <Flex gap={1} alignItems="center">
            Container:
            <Select
                options={options}
                value={[container]}
                onUpdate={([v]) => {
                    setContainer(v);
                }}
            />
        </Flex>
    );
}
