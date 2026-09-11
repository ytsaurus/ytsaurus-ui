import React, {Component} from 'react';
import cn from 'bem-cn-lite';

import format from '../../../../../common/hammer/format';

import ErrorBoundary from '../../../../../containers/ErrorBoundary/ErrorBoundary';
import ElementsTable from '../../../../../components/ElementsTable/ElementsTable';
import RadioButton from '../../../../../components/RadioButton/RadioButton';
import HelpLink from '../../../../../components/HelpLink/HelpLink';
import Button from '../../../../../components/Button/Button';
import Filter from '../../../../../components/Filter/Filter';
import Icon from '../../../../../components/Icon/Icon';
import {UseResizeEventForTable} from '../../../../../components/UseResizeEventForTable/UseResizeEventForTable';

import {
    AGGREGATOR_RADIO_ITEMS,
    DEBOUNCE_DELAY,
    TREE_STATE,
} from '../../../../../constants/operations/statistics';
import {statisticsTableProps} from '../../../../../utils/operations/tabs/statistics/statisticsTableProps';
import {makeRadioButtonProps} from '../../../../../utils';
import {type selectOperationStatisticsFiltered} from '../../../../../store/selectors/operations/statistics-v2';
import {docsUrl} from '../../../../../config';
import UIFactory from '../../../../../UIFactory';
import {WaitForFont} from '../../../../../containers/WaitForFont/WaitForFont';

import {OperationStatisticName, OperationStatisticValue} from './OperationStatisticName';
import i18n from './i18n';

const statisticsBlock = cn('operation-statistics');
const toolbarBlock = cn('elements-toolbar');

type ItemType = ReturnType<typeof selectOperationStatisticsFiltered>[0];

interface ItemState {
    collapsed?: boolean;
    empty?: boolean;
}

type Props = {className?: string} & {
    activeJobType: string;
    activePoolTree: string;
    filterText: string;
    items: ItemType[];
    treeState: (typeof TREE_STATE)[keyof typeof TREE_STATE];
    activeAggregation: 'max' | 'min' | 'count' | 'avg' | 'sum' | undefined;
    jobTypes: string[];
    poolTrees: string[];
    setTreeState(treeState: (typeof TREE_STATE)[keyof typeof TREE_STATE]): void;
    changeFilterText(filterText: string): void;
    changeAggregation(event: React.ChangeEvent<HTMLInputElement>): void;
    changeJobType(jobType?: string): void;
    changePoolTreeFilter(poolTreeFilter?: string): void;
};

export class StatisticsBase extends Component<Props> {
    override componentWillUnmount() {
        this.expandTable();
    }

    // eslint-disable-next-line react/sort-comp
    get template() {
        const {setTreeState, activeAggregation = 'avg'} = this.props;

        return {
            metric(
                item: ItemType,
                _columnName: 'metric',
                toggleItemState: (...args: Array<unknown>) => void,
                itemState: ItemState,
            ) {
                const OFFSET = 40;
                const offsetStyle = {paddingLeft: item.level * OFFSET};

                if (item.isLeafNode) {
                    return (
                        <span className={statisticsBlock('metric')} style={offsetStyle}>
                            <Icon className={statisticsBlock('metric-icon')} awesome="chart-line" />
                            <OperationStatisticName name={item.name} title={item.title} />
                        </span>
                    );
                } else {
                    const togglerIconName =
                        itemState.collapsed || itemState.empty ? 'angle-down' : 'angle-up';
                    const itemIconName =
                        itemState.collapsed || itemState.empty ? 'folder' : 'folder-open';

                    const toggleItemAndTreeState = (...rest: Array<unknown>) => {
                        if (!itemState.empty) {
                            toggleItemState(...rest);
                            setTreeState('mixed');
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
                            <Icon
                                className={statisticsBlock('group-icon')}
                                awesome={itemIconName}
                            />
                            <span>{item.title}</span>
                        </span>
                    );
                }
            },
            __default__(item: ItemType, columnName: keyof Required<typeof item>['data']) {
                if (item.isLeafNode) {
                    const metric = item.data?.[columnName];

                    let value;
                    let settings;

                    if (activeAggregation === 'avg') {
                        value = metric && metric.count && metric.sum / metric.count;

                        if (value! < 1) {
                            settings = {
                                significantDigits: 6,
                            };
                        }
                    } else {
                        value = metric && metric[activeAggregation];
                    }

                    if (activeAggregation === 'count') {
                        return format['Number'](value, settings);
                    }

                    return (
                        <OperationStatisticValue
                            value={value!}
                            settings={settings}
                            name={item.name}
                        />
                    );
                }
                return null;
            },
        };
    }

    collapseTable = () => this.props.setTreeState(TREE_STATE.COLLAPSED);
    expandTable = () => this.props.setTreeState(TREE_STATE.EXPANDED);

    renderToolbar() {
        const {filterText, activeAggregation, jobTypes, poolTrees, activeJobType, activePoolTree} =
            this.props;

        return (
            <div className={toolbarBlock(null, statisticsBlock('toolbar'))}>
                <div className={toolbarBlock('container')}>
                    <div className={toolbarBlock('component', statisticsBlock('filter'))}>
                        <Filter
                            size="m"
                            value={filterText}
                            debounce={DEBOUNCE_DELAY}
                            onChange={this.props.changeFilterText}
                        />
                    </div>

                    {poolTrees.length > 1 && (
                        <div className={toolbarBlock('component')}>
                            <RadioButton
                                size="m"
                                value={activePoolTree ?? ''}
                                onUpdate={this.props.changePoolTreeFilter}
                                items={makeRadioButtonProps(poolTrees, '')}
                                name="operation-statistics-pool-tree"
                            />
                        </div>
                    )}

                    {jobTypes.length > 1 && (
                        <div className={toolbarBlock('component')}>
                            <RadioButton
                                size="m"
                                value={activeJobType ?? ''}
                                onUpdate={this.props.changeJobType}
                                items={makeRadioButtonProps(jobTypes, '')}
                                name="operation-statistics-job-type"
                            />
                        </div>
                    )}

                    <div className={toolbarBlock('component')}>
                        <RadioButton
                            size="m"
                            value={activeAggregation}
                            onChange={this.props.changeAggregation}
                            items={AGGREGATOR_RADIO_ITEMS}
                            name="operation-statistics-aggregator"
                        />
                    </div>

                    <div className={toolbarBlock('component', statisticsBlock('expand-collapse'))}>
                        <span className={statisticsBlock('expand-metrics')}>
                            <Button
                                size="m"
                                title={i18n('action_expand-all')}
                                onClick={this.expandTable}
                            >
                                <Icon awesome="arrow-to-bottom" />
                            </Button>
                        </span>

                        <span className={statisticsBlock('collapse-metrics')}>
                            <Button
                                size="m"
                                title={i18n('action_collapse-all')}
                                onClick={this.collapseTable}
                            >
                                <Icon awesome="arrow-to-top" />
                            </Button>
                        </span>
                    </div>
                    {docsUrl(
                        <div className={toolbarBlock('component', statisticsBlock('help'))}>
                            <HelpLink url={UIFactory.docsUrls['problems:jobstatistics']} />
                        </div>,
                    )}
                </div>
            </div>
        );
    }

    override render() {
        const {className, treeState, items} = this.props;

        return (
            <ErrorBoundary>
                <div className={statisticsBlock(null, className)}>
                    {this.renderToolbar()}
                    <WaitForFont>
                        <UseResizeEventForTable length={items.length} />
                        <ElementsTable
                            {...statisticsTableProps}
                            templates={this.template}
                            css={statisticsBlock()}
                            treeState={treeState}
                            items={items}
                        />
                    </WaitForFont>
                </div>
            </ErrorBoundary>
        );
    }
}
