import React, {Component} from 'react';
import {ConnectedProps, connect, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import ErrorBoundary from '../../../../../components/ErrorBoundary/ErrorBoundary';
import ElementsTable from '../../../../../components/ElementsTable/ElementsTable';
import RadioButton from '../../../../../components/RadioButton/RadioButton';
import HelpLink from '../../../../../components/HelpLink/HelpLink';
import Button from '../../../../../components/Button/Button';
import Filter from '../../../../../components/Filter/Filter';
import Icon from '../../../../../components/Icon/Icon';

import {
    TREE_STATE,
    DEBOUNCE_DELAY,
    AGGREGATOR_RADIO_ITEMS,
} from '../../../../../constants/operations/statistics';
import {
    setTreeState,
    changeFilterText,
    changeAggregation,
    changeJobType,
} from '../../../../../store/actions/operations/statistics';
import {statisticsTableProps} from '../../../../../utils/operations/tabs/statistics/statisticsTableProps';
import {makeRadioButtonProps} from '../../../../../utils';

import {RootState} from '../../../../../store/reducers';
import {getOperationDetailsLoadingStatus} from '../../../../../store/selectors/operations/operation';
import {RumMeasureTypes} from '../../../../../rum/rum-measure-types';
import {useRumMeasureStop} from '../../../../../rum/RumUiContext';
import {isFinalLoadingStatus} from '../../../../../utils/utils';
import {useAppRumMeasureStart} from '../../../../../rum/rum-app-measures';
import {docsUrl} from '../../../../../config';
import UIFactory from '../../../../../UIFactory';

import './Statistics.scss';

export const OPERATION_STATISTICS_BLOCK_NAME = 'operation-statistics';
const statisticsBlock = cn(OPERATION_STATISTICS_BLOCK_NAME);
const toolbarBlock = cn('elements-toolbar');

type Props = ConnectedProps<typeof connector>;

export class Statistics extends Component<Props> {
    componentWillUnmount() {
        this.expandTable();
    }

    get template() {
        const {setTreeState, activeAggregation, activeJobType} = this.props;

        return {
            key: 'operations/detail/statistics/metrics',
            data: {
                jobType: activeJobType,
                setTreeState: setTreeState,
                aggregator: activeAggregation,
            },
        };
    }

    collapseTable = () => this.props.setTreeState(TREE_STATE.COLLAPSED);
    expandTable = () => this.props.setTreeState(TREE_STATE.EXPANDED);

    changeJobType = (e: React.ChangeEvent<HTMLInputElement>) =>
        this.props.changeJobType(e.target.value);

    renderToolbar() {
        const {filterText, activeAggregation, jobTypes, activeJobType} = this.props;

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

                    <div className={toolbarBlock('component')}>
                        <RadioButton
                            size="m"
                            value={activeJobType ?? ''}
                            onChange={this.changeJobType}
                            items={makeRadioButtonProps(jobTypes)}
                            name="operation-statistics-aggregator"
                        />
                    </div>

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
                            <Button size="m" title="Expand All" onClick={this.expandTable}>
                                <Icon awesome="arrow-to-bottom" />
                            </Button>
                        </span>

                        <span className={statisticsBlock('collapse-metrics')}>
                            <Button size="m" title="Collapse All" onClick={this.collapseTable}>
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

    render() {
        const {treeState, items} = this.props;

        return (
            <ErrorBoundary>
                <div className={statisticsBlock()}>
                    {this.renderToolbar()}

                    <ElementsTable
                        {...statisticsTableProps}
                        templates={this.template}
                        css={statisticsBlock()}
                        treeState={treeState}
                        items={items}
                    />
                </div>
            </ErrorBoundary>
        );
    }
}

const mapStateToProps = (state: RootState) => {
    const {items, treeState, filterText, activeAggregation, jobTypes, activeJobType} =
        state.operations.statistics;

    return {
        items,
        treeState,
        filterText,
        activeAggregation,
        jobTypes,
        activeJobType,
    };
};

const mapDispatchToProps = {
    setTreeState,
    changeFilterText,
    changeAggregation,
    changeJobType,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

const StatisticsConnected = connector(Statistics);

export default function SpecificationWithRum() {
    const loadState = useSelector(getOperationDetailsLoadingStatus);

    useAppRumMeasureStart({
        type: RumMeasureTypes.OPERATION_TAB_STATISTICS,
        additionalStartType: RumMeasureTypes.OPERATION,
        startDeps: [loadState],
        allowStart: ([loadState]) => {
            return !isFinalLoadingStatus(loadState);
        },
    });

    useRumMeasureStop({
        type: RumMeasureTypes.OPERATION_TAB_STATISTICS,
        stopDeps: [loadState],
        allowStop: ([loadState]) => {
            return isFinalLoadingStatus(loadState);
        },
    });

    return <StatisticsConnected />;
}
