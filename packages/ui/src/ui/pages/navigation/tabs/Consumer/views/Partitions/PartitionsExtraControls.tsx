import React from 'react';
import {ConnectedProps, connect} from 'react-redux';
import cn from 'bem-cn-lite';

import Filter from '../../../../../../components/Filter/Filter';
import ColumnSelector from '../../../../../../components/ColumnSelector/ColumnSelector';
import RadioButton from '../../../../../../components/RadioButton/RadioButton';
import {CONSUMER_RATE_MODE} from '../../../../../../constants/navigation/tabs/consumer';
import {
    changeConsumerPartitionIndex,
    changeConsumerPartitionsColumns,
    changeConsumerRateMode,
    changeConsumerTimeWindow,
} from '../../../../../../store/actions/navigation/tabs/consumer/filters';
import type {RootState} from '../../../../../../store/reducers';
import type {TPerformanceCounters} from '../../../../../../store/reducers/navigation/tabs/queue/types';
import {
    getConsumerPartitionIndex,
    getConsumerPartitionsColumns,
    getConsumerRateMode,
    getConsumerTimeWindow,
} from '../../../../../../store/selectors/navigation/tabs/consumer';
import Button from '../../../../../../components/Button/Button';
import Icon from '../../../../../../components/Icon/Icon';
import Dropdown from '../../../../../../components/Dropdown/Dropdown';

import './PartitionsExtraControls.scss';
import {PartitionColumn} from '../../../../../../store/reducers/navigation/tabs/consumer/filters';

const block = cn('consumer-partitions');

interface Props extends PropsFromRedux {}

const rateItems: React.ComponentProps<typeof RadioButton>['items'] = [
    {
        value: CONSUMER_RATE_MODE.ROWS,
        text: 'Rows',
    },
    {
        value: CONSUMER_RATE_MODE.DATA_WEIGHT,
        text: 'Data weight',
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
                    Columns
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

const PartitionsExtraControls: React.VFC<Props> = ({
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
                placeholder="Partition index..."
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

function mapStateToProps(state: RootState) {
    return {
        consumerPartitionIndex: getConsumerPartitionIndex(state),
        consumerRateMode: getConsumerRateMode(state),
        consumerTimeWindow: getConsumerTimeWindow(state),
        partitionsColumns: getConsumerPartitionsColumns(state),
    };
}

const mapDispatchToProps = {
    changeConsumerPartitionIndex,
    changeConsumerRateMode,
    changeConsumerTimeWindow,
    changeConsumerPartitionsColumns,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(PartitionsExtraControls);
