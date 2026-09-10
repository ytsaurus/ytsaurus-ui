import React, {useEffect} from 'react';
import {useSelector} from '../../../../../../store/redux-hooks';
import cn from 'bem-cn-lite';
import {type Column, type Settings} from '@gravity-ui/react-data-table';
import {DataTableYT} from '../../../../../../components/DataTableYT';
import {YTErrorBlock} from '../../../../../../containers/Block/Block';
import {type SelectedPartition} from '../../../../../../store/selectors/navigation/tabs/consumer';
import {type YTError} from '../../../../../../types';
import {NoContent} from '../../../../../../components/NoContent';
import {selectTargetQueue} from '../../../../../../store/selectors/navigation/tabs/consumer';

import i18n from './i18n';

export const block = cn('consumer-partitions');

const settings: Settings = {displayIndices: false};

export const PartitionsBase: React.VFC<PropsFromRedux> = ({
    loadConsumerPartitions,
    columns,
    partitions,
    partitionsError,
    partitionsLoading,
    partitionsLoaded,
}) => {
    const {queue} = useSelector(selectTargetQueue) ?? {};

    useEffect(() => {
        if (queue) {
            loadConsumerPartitions(queue);
        }
    }, [queue]);

    if (!queue) {
        return (
            <NoContent
                hint={i18n('alert_select-queue')}
                warning={i18n('alert_no-selected-queues')}
            />
        );
    }

    if (partitionsError) {
        return <YTErrorBlock error={partitionsError} topMargin="half" />;
    }

    return (
        <DataTableYT
            className={block('table-row')}
            columns={columns}
            data={partitions}
            loading={partitionsLoading}
            loaded={partitionsLoaded}
            useThemeYT
            settings={settings}
        />
    );
};
type PropsFromRedux = {
    columns: Column<SelectedPartition>[];
    partitions: SelectedPartition[];
    partitionsError: YTError | null;
    partitionsLoading: boolean;
    partitionsLoaded: boolean;
    loadConsumerPartitions: (queue: string) => void;
};
