import React, {Component, Fragment} from 'react';
import {Sticky, StickyContainer} from 'react-sticky';
import {connect, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import hammer from '../../../../../common/hammer';
import cn from 'bem-cn-lite';

import {Progress} from '@gravity-ui/uikit';

import ElementsTableSticky from '../../../../../components/ElementsTable/ElementsTableSticky';
import Overview from '../../../../../pages/scheduling/Content/tabs/Overview/Overview';
import ErrorBoundary from '../../../../../components/ErrorBoundary/ErrorBoundary';
import RadioButton from '../../../../../components/RadioButton/RadioButton';
import Filter from '../../../../../components/Filter/Filter';

import {
    changeContentMode,
    changePool,
    changePoolChildrenFilter,
    openEditModal,
} from '../../../../../store/actions/scheduling/scheduling';
import {openPoolDeleteModal} from '../../../../../store/actions/scheduling/scheduling-ts';
import {SCHEDULING_POOL_CHILDREN_TABLE_ID, Tab} from '../../../../../constants/scheduling';
import {calculateTotalOverPools} from '../../../../../utils/scheduling/details';
import {childTableItems} from '../../../../../utils/scheduling/detailsTable';
import {HEADER_HEIGHT} from '../../../../../constants/index';
import {getCluster} from '../../../../../store/selectors/global';
import {
    getContentMode,
    getCurrentPool,
    getPollChildrenTableItems,
    getPoolChildrenFilter,
    getSortedPoolChildren,
} from '../../../../../store/selectors/scheduling/scheduling';

import {getSchedulingIsFinalLoadingState} from '../../../../../store/selectors/scheduling';
import {useRumMeasureStop} from '../../../../../rum/RumUiContext';
import {RumMeasureTypes} from '../../../../../rum/rum-measure-types';
import {getProgressTheme} from '../../../../../utils/progress';
import {useAppRumMeasureStart} from '../../../../../rum/rum-app-measures';
import {Tooltip} from '../../../../../components/Tooltip/Tooltip';
import {Bold, Secondary} from '../../../../../components/Text/Text';

import SchedulingOperationsError from '../SchedulingOperationsError/SchedulingOperationsError';
import {getPoolPathsByName} from '../../../../../store/actions/scheduling/scheduling-operations';

import PoolTags from '../Overview/PoolTags';

import './Details.scss';

const block = cn('scheduling-details');

class Details extends Component {
    static renderDominantResource(item) {
        return hammer.format['ReadableField'](item.dominantResource);
    }

    static renderMinShare(item) {
        return Overview.renderRatio(item.minShareRatio);
    }

    static renderMaxShare(item) {
        return Overview.renderRatio(item.maxShareRatio);
    }

    static renderColumnAsRatio(item, columnName) {
        const data = childTableItems[columnName].get(item);

        return Overview.renderRatio(data);
    }

    static renderColumnAsNumber(item, columnName) {
        const data = childTableItems[columnName].get(item);

        return hammer.format['Number'](data);
    }

    static renderMaxOperationCount(item) {
        const {maxOperationCount, maxOperationCountEdited} = item;
        return Details.renderNumberWithEdited(maxOperationCount, maxOperationCountEdited);
    }

    static renderMaxRunningOperationCount(item) {
        const {maxRunningOperationCount, maxRunningOperationCountEdited} = item;
        return Details.renderNumberWithEdited(
            maxRunningOperationCount,
            maxRunningOperationCountEdited,
        );
    }

    static renderNumberWithEdited(value, editedValue) {
        const content = hammer.format.Number(value);

        const autoCalculated = isNaN(editedValue);
        return (
            <Tooltip content={autoCalculated ? 'Automatically calculated' : 'Explicitly defined'}>
                {autoCalculated ? <Secondary>{content}</Secondary> : <Bold>{content}</Bold>}
            </Tooltip>
        );
    }

    static renderColumnAsBytes(item, columnName) {
        const data = childTableItems[columnName].get(item);

        return hammer.format['Bytes'](data);
    }

    static renderColumnAsFloatNumber(item, columnName) {
        const data = childTableItems[columnName].get(item);

        return hammer.format['Number'](data, {
            digits: 2,
            digitsOnlyForFloat: true,
        });
    }

    static renderIntegralGuarantee(item, columnName) {
        const data = childTableItems[columnName].get(item);

        const {integralType} = item;
        const hasActiveGuarantee = integralType && integralType !== 'none';

        const value = hammer.format['Number'](data, {
            digits: 2,
            digitsOnlyForFloat: true,
        });

        return hasActiveGuarantee ? (
            value
        ) : (
            <Tooltip
                className={block('integral-guarantee', {
                    inactive: !hasActiveGuarantee,
                })}
                content={'It is impossible to use the guarantee until "Guarantee type" is defined'}
            >
                {value}
            </Tooltip>
        );
    }

    static renderColumnAsReadable(item, columnName) {
        const data = childTableItems[columnName].get(item);

        return hammer.format['ReadableField'](data);
    }

    static renderIntegralType(item, columnName) {
        const data = childTableItems[columnName].get(item);

        return data === undefined
            ? hammer.format.NO_VALUE
            : Details.renderColumnAsReadable(item, columnName);
    }

    static renderAsProgress(item, columnName) {
        const value = childTableItems[columnName].get(item);
        const theme = getProgressTheme(value);
        const text = childTableItems[columnName].text(item);
        return isNaN(value) ? (
            hammer.format.NO_VALUE
        ) : (
            <Progress value={value * 100} theme={theme} text={text} />
        );
    }

    static childrenIntegrals(item, columnName) {
        const value = childTableItems[columnName].get(item);
        return !value
            ? hammer.format.NO_VALUE
            : hammer.format.Number(value, {
                  digits: 2,
                  digitsOnlyForFloat: true,
              });
    }

    static propTypes = {
        // from connect
        mode: PropTypes.string.isRequired,
        filter: PropTypes.string.isRequired,
        cluster: PropTypes.string.isRequired,
        currentPool: PropTypes.shape({
            name: PropTypes.string.isRequired,
        }),
        items: PropTypes.arrayOf(Overview.tableItemPropTypes).isRequired,
        children: PropTypes.arrayOf(Overview.tableItemPropTypes),

        changePoolChildrenFilter: PropTypes.func.isRequired,
        changeContentMode: PropTypes.func.isRequired,
        openEditModal: PropTypes.func.isRequired,
        openPoolDeleteModal: PropTypes.func.isRequired,
        changePool: PropTypes.func.isRequired,
    };

    get columnsSets() {
        return {
            cpu: {
                items: [
                    'name',
                    'FI',
                    'weight',
                    'min_resources_cpu',
                    'abs_guaranteed_cpu',
                    //'rel_guaranteed_cpu',
                    'abs_demand_cpu',
                    'resource_detailed_cpu',
                    'abs_usage_cpu',
                    //'rel_usage_cpu',
                    'resource_limit_cpu',
                    //'guaranteed_usage_cpu',
                    'actions',
                ],
            },
            memory: {
                items: [
                    'name',
                    'FI',
                    'weight',
                    'min_resources_memory',
                    'abs_guaranteed_memory',
                    //'rel_guaranteed_memory',
                    'abs_demand_memory',
                    'resource_detailed_memory',
                    'abs_usage_memory',
                    //'rel_usage_memory',
                    'resource_limit_memory',
                    //'guaranteed_usage_memory',
                    'actions',
                ],
            },
            gpu: {
                items: [
                    'name',
                    'FI',
                    'weight',
                    'min_resources_gpu',
                    'abs_guaranteed_gpu',
                    //'rel_guaranteed_gpu',
                    'abs_demand_gpu',
                    'resource_detailed_gpu',
                    'abs_usage_gpu',
                    //'rel_usage_gpu',
                    'resource_limit_gpu',
                    //'guaranteed_usage_gpu',
                    'actions',
                ],
            },
            user_slots: {
                items: [
                    'name',
                    'FI',
                    'weight',
                    'min_resources_user_slots',
                    'abs_guaranteed_user_slots',
                    //'rel_guaranteed_user_slots',
                    'abs_demand_user_slots',
                    'resource_detailed_user_slots',
                    'abs_usage_user_slots',
                    //'rel_usage_user_slots',
                    'resource_limit_user_slots',
                    //'guaranteed_usage_user_slots',
                    'actions',
                ],
            },
            operations: {
                items: [
                    'name',
                    'FI',
                    'running_operation_count',
                    'max_running_operation_count',
                    'running_operation_progress',
                    'operation_count',
                    'max_operation_count',
                    'operation_progress',
                    'actions',
                ],
            },
            integral: {
                items: [
                    'name',
                    'FI',
                    'integral_type',
                    'burst_cpu',
                    'children_burst_cpu',
                    'flow_cpu',
                    'children_flow_cpu',
                    'accumulated',
                    //'accumulated_cpu',
                    'burst_duration',
                    'actions',
                ],
            },
        };
    }

    get tableSettings() {
        const {mode, children} = this.props;
        const isCurrentPool = this.isCurrentPool;
        const totalRow = children?.length ? calculateTotalOverPools(children) : undefined;

        return {
            css: block(),
            theme: 'light',
            striped: false,
            tableId: SCHEDULING_POOL_CHILDREN_TABLE_ID,
            footer: totalRow,
            header: false,
            top: 99,
            columns: {
                items: childTableItems,
                sets: this.columnsSets,
                mode,
            },
            templates: {
                name: this.renderNameCell,
                mode: Overview.renderMode,
                FI: Overview.renderFifoIndex,
                weight: Overview.renderWeight,
                dominant_resource: Details.renderDominantResource,
                min_share: Details.renderMinShare,
                max_share: Details.renderMaxShare,
                operation_overview: Overview.renderOperationOverview,
                demand: Details.renderColumnAsRatio,
                fair_share: Details.renderColumnAsRatio,
                usage: Details.renderColumnAsRatio,
                fair_share_usage: Overview.renderFairShareUsage,

                resource_detailed_cpu: Details.renderColumnAsFloatNumber,
                resource_detailed_memory: Details.renderColumnAsBytes,
                resource_detailed_gpu: Details.renderColumnAsNumber,
                resource_detailed_user_slots: Details.renderColumnAsNumber,

                resource_limit_cpu: Details.renderColumnAsFloatNumber,
                resource_limit_memory: Details.renderColumnAsBytes,
                resource_limit_gpu: Details.renderColumnAsNumber,
                resource_limit_user_slots: Details.renderColumnAsNumber,

                min_resources_cpu: Details.renderColumnAsFloatNumber,
                min_resources_memory: Details.renderColumnAsBytes,
                min_resources_gpu: Details.renderColumnAsNumber,
                min_resources_user_slots: Details.renderColumnAsNumber,

                abs_guaranteed_cpu: Details.renderColumnAsFloatNumber,
                abs_guaranteed_memory: Details.renderColumnAsBytes,
                abs_guaranteed_gpu: Details.renderColumnAsFloatNumber,
                abs_guaranteed_user_slots: Details.renderColumnAsFloatNumber,

                abs_demand_cpu: Details.renderColumnAsNumber,
                abs_demand_memory: Details.renderColumnAsBytes,
                abs_demand_gpu: Details.renderColumnAsNumber,
                abs_demand_user_slots: Details.renderColumnAsNumber,

                abs_usage_cpu: Details.renderColumnAsNumber,
                abs_usage_memory: Details.renderColumnAsBytes,
                abs_usage_gpu: Details.renderColumnAsNumber,
                abs_usage_user_slots: Details.renderColumnAsNumber,

                rel_guaranteed_cpu: this.renderRelResource,
                rel_guaranteed_memory: this.renderRelResource,
                rel_guaranteed_gpu: this.renderRelResource,
                rel_guaranteed_user_slots: this.renderRelResource,

                rel_usage_cpu: this.renderRelResource,
                rel_usage_memory: this.renderRelResource,
                rel_usage_gpu: this.renderRelResource,
                rel_usage_user_slots: this.renderRelResource,

                guaranteed_usage_cpu: this.renderResourceBars,
                guaranteed_usage_memory: this.renderResourceBars,
                guaranteed_usage_gpu: this.renderResourceBars,
                guaranteed_usage_user_slots: this.renderResourceBars,

                running_operation_progress: Details.renderAsProgress,
                running_operation_count: Details.renderColumnAsNumber,
                operation_count: Details.renderColumnAsNumber,
                operation_progress: Details.renderAsProgress,
                max_running_operation_count: Details.renderMaxRunningOperationCount,
                max_operation_count: Details.renderMaxOperationCount,

                integral_type: Details.renderIntegralType,
                burst_cpu: Details.renderIntegralGuarantee,
                flow_cpu: Details.renderIntegralGuarantee,
                children_burst_cpu: Details.childrenIntegrals,
                children_flow_cpu: Details.childrenIntegrals,
                accumulated: Details.renderColumnAsRatio,
                accumulated_cpu: Details.renderColumnAsNumber,
                burst_duration: Details.renderColumnAsNumber,

                actions: this.renderActions,
            },
            computeKey(item) {
                return item.name;
            },
            itemMods(item) {
                return {
                    current: isCurrentPool(item) ? 'yes' : '',
                    aggregation: item.aggregation ? 'yes' : '',
                };
            },
        };
    }

    renderResourceBars = (item, columnName) => {
        const isCurrentPool = this.isCurrentPool(item);

        if (isCurrentPool) {
            return hammer.format.NO_VALUE;
        }

        const {currentPool} = this.props;
        const resourceData = childTableItems[columnName].get(item, currentPool);
        const barsData = [
            {
                value: resourceData.guaranteed,
                title: 'Guaranteed share',
                theme: 'success',
            },
            {
                value: resourceData.usage,
                title: 'Usage',
                theme: 'info',
            },
        ];

        return Overview.renderBars(barsData);
    };

    renderRelResource = (item, columnName) => {
        const isCurrentPool = this.isCurrentPool(item);

        if (isCurrentPool) {
            return hammer.format.NO_VALUE;
        }

        const {currentPool} = this.props;
        const data = childTableItems[columnName].get(item, currentPool);

        return Overview.renderRatio(data);
    };

    renderNameCell = (item, ...rest) => {
        const {cluster, currentPool, changePool} = this.props;

        return (
            <span className={block('name-cell', {child: item.isChildPool})}>
                {Overview.renderType(item, ...rest)}
                <span className={block('name-cell-text')}>
                    {Overview.renderName(item, Tab.DETAILS, cluster, currentPool, changePool)}
                </span>
                {Overview.renderEphemeralIcon(item)}
                <PoolTags pool={item} />
            </span>
        );
    };

    renderActions = (item) => {
        const {openEditModal, openPoolDeleteModal, getPoolPathsByName} = this.props;

        if (item.aggregation) {
            return;
        }

        if (item.type !== 'pool') {
            return Overview.renderAttributesButton(item);
        }

        const handleEditClick = () => openEditModal(item);
        const handleDeleteClick = () => openPoolDeleteModal(item);

        return (
            <Fragment>
                {Overview.renderAttributesButton(item, getPoolPathsByName)}
                &nbsp;
                {Overview.renderEditButton(item, handleEditClick)}
                &nbsp;
                {Overview.renderDeleteButton(item, handleDeleteClick)}
            </Fragment>
        );
    };

    isCurrentPool = (item) => item.name === this.props.currentPool.name;

    renderToolbar() {
        const {filter, mode, changePoolChildrenFilter, changeContentMode, currentPool} = this.props;

        return (
            <Sticky topOffset={-HEADER_HEIGHT}>
                {({isSticky}) => (
                    <div className={block('toolbar', {sticky: isSticky})}>
                        <Filter
                            key={currentPool?.name}
                            size="m"
                            value={filter}
                            placeholder="Filter..."
                            className={block('filter')}
                            onChange={changePoolChildrenFilter}
                        />

                        <RadioButton
                            size="m"
                            value={mode}
                            onChange={changeContentMode}
                            name="navigation-tablets-mode"
                            items={[
                                {
                                    value: 'cpu',
                                    text: 'CPU',
                                },
                                {
                                    value: 'memory',
                                    text: 'Memory',
                                },
                                {
                                    value: 'gpu',
                                    text: 'GPU',
                                },
                                {
                                    value: 'user_slots',
                                    text: 'User slots',
                                },
                                {
                                    value: 'operations',
                                    text: 'Operations',
                                },
                                {
                                    value: 'integral',
                                    text: 'Integral guarantees',
                                },
                            ]}
                        />
                    </div>
                )}
            </Sticky>
        );
    }

    render() {
        const {items, mode} = this.props;

        return (
            <ErrorBoundary>
                <div className={block()}>
                    <StickyContainer>
                        {this.renderToolbar()}
                        <SchedulingOperationsError />
                        <ElementsTableSticky
                            cssTableMods={{mode}}
                            {...this.tableSettings}
                            items={items}
                        />
                    </StickyContainer>
                </div>
            </ErrorBoundary>
        );
    }
}

const mapStateToProps = (state) => {
    const currentPool = getCurrentPool(state);
    const items = getPollChildrenTableItems(state);
    const mode = getContentMode(state);
    const filter = getPoolChildrenFilter(state);
    const cluster = getCluster(state);
    const children = getSortedPoolChildren(state);

    return {currentPool, mode, filter, items, children, cluster};
};

const mapDispatchToProps = {
    changePoolChildrenFilter,
    changeContentMode,
    openEditModal,
    openPoolDeleteModal,
    changePool,
    getPoolPathsByName,
};

const DetailsConnected = connect(mapStateToProps, mapDispatchToProps)(Details);

export default function DetailsWithRum() {
    const isFinalState = useSelector(getSchedulingIsFinalLoadingState);

    useAppRumMeasureStart({
        type: RumMeasureTypes.SCHEDULING_DETAILS,
        additionalStartType: RumMeasureTypes.SCHEDULING,
        startDeps: [isFinalState],
        allowStart: ([isFinal]) => {
            return !isFinal;
        },
    });

    useRumMeasureStop({
        type: RumMeasureTypes.SCHEDULING_DETAILS,
        stopDeps: [isFinalState],
        allowStop: ([isFinal]) => {
            return isFinal;
        },
    });

    return <DetailsConnected />;
}
