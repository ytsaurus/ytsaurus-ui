import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {Flex, Select} from '@gravity-ui/uikit';
import {useFetchBatchQuery} from '../../../store/api/yt';
import {systemMonitoring} from '../../../store/reducers/system/monitoring';
import {YTApiId} from '../../../rum/rum-wrap-api';

export function MasterLocalContainers({allValue}: {allValue: string}) {
    const dispatch = useDispatch();
    const container = useSelector(systemMonitoring.selectors.getMasterLocalContainer) ?? allValue;

    const {data} = useFetchBatchQuery<Array<string>>({
        id: YTApiId.systemClusterMasters,
        parameters: {requests: [{command: 'list', parameters: {path: '//sys/cluster_masters'}}]},
        errorTitle: 'Failed to load masters',
    });

    const options = React.useMemo(() => {
        const res = [{value: allValue, content: allValue}];
        data?.[0]?.output?.forEach((i) => {
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
                    dispatch(systemMonitoring.actions.onUpdate({masterLocalContainer: v}));
                }}
            />
        </Flex>
    );
}
