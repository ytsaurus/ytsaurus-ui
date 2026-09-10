import React from 'react';
import cn from 'bem-cn-lite';

import Filter from '../../../../../../../components/Filter/Filter';
import ColumnSelector from '../../../../../../../components/ColumnSelector/ColumnSelector';
import RadioButton from '../../../../../../../components/RadioButton/RadioButton';
import {CONSUMER_RATE_MODE} from '../../../../../../../constants/navigation/tabs/consumer';
import {
    type ConsumerPartitionsColumns,
    type PartitionColumn,
} from '../../../../../../../store/reducers/navigation/tabs/consumer/filters';
import {type TPerformanceCounters} from '../../../../../../../store/reducers/navigation/tabs/queue/types';
import Button from '../../../../../../../components/Button/Button';
import Icon from '../../../../../../../components/Icon/Icon';
import Dropdown from '../../../../../../../components/Dropdown/Dropdown';
import i18n from '../i18n';

const block = cn('consumer-partitions');

interface Props extends PropsFromRedux {}

const rateItems: React.ComponentProps<typeof RadioButton>['items'] = [
    {
        value: CONSUMER_RATE_MODE.ROWS,
        get text() {
            return i18n('value_rows');
        },
    },
    {
        value: CONSUMER_RATE_MODE.DATA_WEIGHT,
        get text() {
            return i18n('value_data-weight');
        },
    },
];

export const timeItems: React.ComponentProps<typeof RadioButton>['items'] = [
    {
        value: '1m' as keyof TPerformanceCounters,
        text: '1m',
    },
    {
        value: '1h' as keyof TPerformanceCounters,
        text: '1h',
    },
    {
        value: '1d' as keyof TPerformanceCounters,
        text: '1d',
    },
];

export interface CompactColumnSelectorProps<Names> {
    items: Array<PartitionColumn<Names>>;
    onChange: Function;
}
export function CompactColumnSelector<Names>({items, onChange}: CompactColumnSelectorProps<Names>) {
    return (
        <Dropdown
            className={block('filters-item')}
            trigger="click"
            directions={['bottom']}
            button={
                <Button pin={'round-round'}>
                    <Icon awesome="table" face="light" />
                    {i18n('action_columns')}
                </Button>
            }
            template={
                <ColumnSelector
                    items={items}
                    onChange={onChange}
                    className={block('custom-column-selector')}
                />
            }
        />
    );
}

export const PartitionsExtraControlsBase: React.VFC<Props> = ({
    consumerPartitionIndex,
    consumerRateMode,
    consumerTimeWindow,
    partitionsColumns,
    changeConsumerPartitionIndex,
    changeConsumerRateMode,
    changeConsumerTimeWindow,
    changeConsumerPartitionsColumns,
}) => {
    return (
        <>
            <div className={block('divider')} />
            <Filter
                className={block('filter')}
                value={consumerPartitionIndex}
                onChange={changeConsumerPartitionIndex}
                placeholder={i18n('field_partition-index')}
            />
            <div className={block('divider')} />
            <RadioButton
                value={consumerRateMode}
                onChange={changeConsumerRateMode}
                items={rateItems}
            />
            <RadioButton
                value={consumerTimeWindow}
                onChange={changeConsumerTimeWindow}
                items={timeItems}
            />
            <CompactColumnSelector
                onChange={changeConsumerPartitionsColumns}
                items={partitionsColumns}
            />
        </>
    );
};
type PropsFromRedux = {
    consumerPartitionIndex: string;
    consumerRateMode: CONSUMER_RATE_MODE;
    consumerTimeWindow: keyof TPerformanceCounters;
    partitionsColumns: PartitionColumn<ConsumerPartitionsColumns>[];
    changeConsumerPartitionIndex: (value: string) => void;
    changeConsumerRateMode: (evt: React.ChangeEvent<HTMLInputElement>) => void;
    changeConsumerTimeWindow: (evt: React.ChangeEvent<HTMLInputElement>) => void;
    changeConsumerPartitionsColumns(data: {
        items: Array<PartitionColumn<ConsumerPartitionsColumns>>;
    }): void;
};
