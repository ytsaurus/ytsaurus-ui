import React, {useCallback} from 'react';
import sortBy_ from 'lodash/sortBy';

import {Flex} from '@gravity-ui/uikit';
import Suggest, {type SuggestItem} from '../../../components/Suggest/Suggest';
import {useFetchBatchQuery} from '../../../store/api/yt';
import {YTApiId} from '../../../rum/rum-wrap-api';
import {filterSuggestItems} from './helpers/filterSuggestItems';
import i18n from './i18n';

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
        errorTitle: i18n('alert_failed-to-load-masters'),
    });

    const items = React.useMemo(() => {
        const res = [allValue];
        sortBy_(data?.[0]?.output).forEach((item) => {
            res.push(item);
        });
        return res;
    }, [data, allValue]);

    const applyContainer = useCallback(
        (item: SuggestItem) => {
            const value = typeof item === 'string' ? item : item.value;
            setContainer(value);
        },
        [setContainer],
    );

    const onEnterKeyDown = useCallback(
        (value: string) => {
            if (value.trim()) {
                applyContainer(value);
            }
        },
        [applyContainer],
    );

    return (
        <Flex gap={1} alignItems="center">
            {i18n('field_container')}:
            <Suggest
                text={container}
                items={items}
                filter={filterSuggestItems}
                apply={applyContainer}
                onEnterKeyDown={onEnterKeyDown}
            />
        </Flex>
    );
}
