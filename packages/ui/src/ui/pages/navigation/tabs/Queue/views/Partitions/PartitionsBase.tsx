import React, {useEffect} from 'react';
import cn from 'bem-cn-lite';
import {type Column, type Settings} from '@gravity-ui/react-data-table';
import {DataTableYT} from '../../../../../../components/DataTableYT';
import {YTErrorBlock} from '../../../../../../containers/Block/Block';
import {type SelectedPartition} from '../../../../../../store/selectors/navigation/tabs/queue';
import {type YTError} from '../../../../../../types';

export const block = cn('queue-partitions');

const settings: Settings = {displayIndices: false};

export const PartitionsBase: React.VFC<PropsFromRedux> = ({
    loadQueuePartitions,
    columns,
    partitions,
    partitionsError,
    partitionsLoading,
    partitionsLoaded,
}) => {
    useEffect(() => {
        loadQueuePartitions();
    }, []);

    if (partitionsError) {
        return <YTErrorBlock error={partitionsError} topMargin="half" />;
    }

    return (
        <DataTableYT
            className={block()}
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
    loadQueuePartitions: () => void;
};
