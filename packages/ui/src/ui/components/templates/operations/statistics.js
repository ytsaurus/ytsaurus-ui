import React from 'react';
import cn from 'bem-cn-lite';

import templates from '../../../components/templates/utils';
import hammer from '../../../common/hammer';
import {
    OperationStatisticName,
    OperationStatisticValue,
} from '../../../pages/operations/OperationDetail/tabs/statistics/OperationStatisticName';
import {OPERATION_STATISTICS_BLOCK_NAME} from '../../../pages/operations/OperationDetail/tabs/statistics/Statistics';
import Icon from '../../Icon/Icon';

const statisticsBlock = cn(OPERATION_STATISTICS_BLOCK_NAME);

templates.add('operations/detail/statistics/metrics', {
    metric(item, columnName, toggleItemState, itemState) {
        const OFFSET = 40;
        const offsetStyle = {paddingLeft: item.level * OFFSET};

        if (item.isLeafNode) {
            return (
                <span className={statisticsBlock('metric')} style={offsetStyle}>
                    <Icon className={statisticsBlock('metric-icon')} awesome="chart-line" />
                    <OperationStatisticName name={item.name} title={item.attributes.name} />
                </span>
            );
        } else {
            const togglerIconName =
                itemState.collapsed || itemState.empty ? 'angle-down' : 'angle-up';
            const itemIconName = itemState.collapsed || itemState.empty ? 'folder' : 'folder-open';

            const toggleItemAndTreeState = (...rest) => {
                if (!itemState.empty) {
                    toggleItemState(...rest);
                    this.props.templates.data.setTreeState('mixed');
                }
            };

            return (
                <span
                    className={statisticsBlock('group')}
                    style={offsetStyle}
                    onClick={toggleItemAndTreeState}
                >
                    <Icon
                        className={statisticsBlock('group-icon-toggler')}
                        awesome={togglerIconName}
                    />
                    <Icon className={statisticsBlock('group-icon')} awesome={itemIconName} />
                    <span>{item.attributes.name}</span>
                </span>
            );
        }
    },
    __default__(item, columnName) {
        if (item.isLeafNode) {
            const jobType = this.props.templates.data.jobType;
            const aggregator = this.props.templates.data.aggregator;

            let metric = item.attributes.value[columnName];

            metric = metric && metric[jobType];

            let value;
            let settings;

            if (aggregator === 'avg') {
                value = metric && metric.count && metric.sum / metric.count;

                if (metric < 1) {
                    settings = {
                        significantDigits: 6,
                    };
                }
            } else {
                value = metric && metric[aggregator];
            }

            if (aggregator === 'count') {
                return hammer.format['Number'](value, settings);
            }

            return <OperationStatisticValue value={value} settings={settings} name={item.name} />;
        }
    },
});
