import {Sticky, StickyContainer} from 'react-sticky';
import React, {Component, Fragment} from 'react';
import {connect, useDispatch, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import hammer from '../../../../../common/hammer';
import cn from 'bem-cn-lite';
import qs from 'qs';

import ElementsTable from '../../../../../components/ElementsTable/ElementsTable';
import {FormattedLink, FormattedText} from '../../../../../components/formatters';

import ClickableAttributesButton from '../../../../../components/AttributesButton/ClickableAttributesButton';
import ErrorBoundary from '../../../../../components/ErrorBoundary/ErrorBoundary';
import Filter from '../../../../../components/Filter/Filter';
import Button from '../../../../../components/Button/Button';
import Label from '../../../../../components/Label/Label';
import Link from '../../../../../components/Link/Link';
import Icon from '../../../../../components/Icon/Icon';

import {
    changePool,
    changeTableTreeState,
    openEditModal,
} from '../../../../../store/actions/scheduling/scheduling';
import {
    openPoolDeleteModal,
    schedulingSetAbcFilter,
    schedulingSetFilter,
} from '../../../../../store/actions/scheduling/scheduling-ts';
import {
    getCurrentPool,
    getIsRoot,
    getSchedulingIsInitialLoading,
    getSchedulingOverviewMaxDepth,
    getSchedulingTreeState,
    getTableItems,
    getTree,
} from '../../../../../store/selectors/scheduling/scheduling';
import {
    getSchedulingAbcFilter,
    getSchedulingFilter,
} from '../../../../../store/selectors/scheduling/attributes-to-filter';
import {SCHEDULING_POOL_TREE_TABLE_ID, Tab} from '../../../../../constants/scheduling';
import {poolsTableItems} from '../../../../../utils/scheduling/overviewTable';
import {HEADER_HEIGHT, Page} from '../../../../../constants/index';
import {getCluster} from '../../../../../store/selectors/global';

import {useRumMeasureStop} from '../../../../../rum/RumUiContext';
import {useAppRumMeasureStart} from '../../../../../rum/rum-app-measures';
import {RumMeasureTypes} from '../../../../../rum/rum-measure-types';
import {getSchedulingIsFinalLoadingState} from '../../../../../store/selectors/scheduling';
import ShareUsageBar from '../../controls/ShareUsageBar';
import SchedulingStaticConfiguration from '../../../PoolStaticConfiguration/SchedulingStaticConfiguration';

import './Overview.scss';
import {Dialog} from '@gravity-ui/uikit';
import {Tooltip} from '../../../../../components/Tooltip/Tooltip';
import SchedulingOperationsError from '../SchedulingOperationsError/SchedulingOperationsError';
import {
    getPoolPathsByName,
    getSchedulingOperationsCount,
    resetExpandedPools,
    setExpandedPool,
    setLoadAllOperations,
} from '../../../../../store/actions/scheduling/expanded-pools';
import PoolTags from './PoolTags';
import UIFactory from '../../../../../UIFactory';

const block = cn('scheduling-overview');

const STARVATION_STATUS_TO_THEME = {
    starving: 'warning',
    aggressively_starving: 'danger',
};

class Overview extends Component {
    static resourcePropTypes = PropTypes.shape({
        type: PropTypes.string.isRequired,
        progress: PropTypes.object.isRequired,
    });

    static tableItemPropTypes = PropTypes.shape({
        abc: PropTypes.object,
        name: PropTypes.string.isRequired,
        fairShareRatio: PropTypes.number,
        usageRatio: PropTypes.number,
        weight: PropTypes.number,
        demandRatio: PropTypes.number,

        runningOperationCount: PropTypes.number,
        operationCount: PropTypes.number,
        children: PropTypes.array,
        level: PropTypes.number,
        type: PropTypes.string,
        mode: PropTypes.string,
    });

    static propTypes = {
        // from connect
        treeState: PropTypes.string.isRequired,
        cluster: PropTypes.string.isRequired,
        filter: PropTypes.string.isRequired,
        items: PropTypes.arrayOf(Overview.tableItemPropTypes).isRequired,
        currentPool: PropTypes.shape({
            name: PropTypes.string.isRequired,
        }),

        changePool: PropTypes.func.isRequired,
        openPoolDeleteModal: PropTypes.func.isRequired,
        schedulingSetFilter: PropTypes.func.isRequired,
        openEditModal: PropTypes.func.isRequired,
        changeTableTreeState: PropTypes.func.isRequired,
        schedulingSetAbcFilter: PropTypes.func.isRequired,

        isInitialLoading: PropTypes.bool,
    };

    static poolModeTheme = {
        fair_share: 'default',
        fifo: 'info',
    };

    static renderBars([share, usage] = [], {forceTheme = undefined, title = undefined}) {
        return (
            <ShareUsageBar
                className={block('bars')}
                shareValue={share?.value}
                shareTitle={share?.title}
                usageValue={usage?.value}
                usageTitle={usage?.title}
                forceTheme={forceTheme}
                title={title}
            />
        );
    }

    static renderRatio(data) {
        const EPSILON = 1e-6;

        if (data < EPSILON) {
            return 0;
        } else if (data === 1) {
            return 1;
        }

        return hammer.format['Number'](data, {digits: 6});
    }

    static renderMode(item) {
        if (item.mode) {
            const text = hammer.format['ReadableField'](item.mode);
            const theme = Overview.poolModeTheme[item.mode];

            return <Label text={text} theme={theme} />;
        }

        return hammer.format.NO_VALUE;
    }

    static renderWeight(item) {
        const {weightEdited} = item;
        const edited = !isNaN(weightEdited);
        return (
            <span className={block('weight-content', {edited})}>
                <Tooltip content={edited ? 'Explicitly defined' : 'Automatically calculated'}>
                    {hammer.format['Number'](item.weight, {
                        digits: 6,
                        digitsOnlyForFloat: true,
                    })}
                </Tooltip>
            </span>
        );
    }

    static renderColumnAsRatio(item, columnName) {
        const data = poolsTableItems[columnName].get(item);

        return Overview.renderRatio(data);
    }

    static renderFairShareUsage(item) {
        const barsData = [
            {
                value: item.fairShareRatio,
                title: 'Fair share',
                theme: 'success',
            },
            {
                value: item.usageRatio,
                title: 'Usage',
                theme: 'info',
            },
        ];

        const {starvation_status} = item;
        const forceTheme = STARVATION_STATUS_TO_THEME[starvation_status];

        return Overview.renderBars(barsData, {
            forceTheme,
            title: !forceTheme ? null : (
                <div className={block('starvation-status')}>
                    <Label theme={forceTheme} text={hammer.format.Readable(starvation_status)} />
                </div>
            ),
        });
    }

    static renderOperationOverview(item) {
        const formatter = hammer.format['Number'];

        return formatter(item.runningOperationCount) + ' / ' + formatter(item.operationCount);
    }

    static renderAttributesButton(item, getPoolPaths) {
        const buttonProps = getPoolPaths
            ? {
                  getPathProps: () => {
                      return {
                          exactPath: getPoolPaths(item.name).orchidPath,
                      };
                  },
              }
            : {
                  attributes: item.attributes,
              };
        return <ClickableAttributesButton title={item.name} {...buttonProps} />;
    }

    static renderEditButton(item, onClick) {
        if (item.isEphemeral) {
            return null;
        }
        const title = `edit pool ${item?.name || ''}`;
        return (
            <Button title={title} size="s" view="flat-secondary" onClick={onClick}>
                <Icon awesome="pencil" />
            </Button>
        );
    }

    static renderFifoIndex(item) {
        if (item.fifoIndex === undefined || item.type !== 'operation') {
            return '';
        } else {
            return item.fifoIndex;
        }
    }

    static renderDeleteButton(item, onClick) {
        if (item.isEphemeral) {
            return null;
        }
        return (
            <Button size="s" view="flat-secondary" onClick={onClick}>
                <Icon awesome="trash-bin" />
            </Button>
        );
    }

    static renderType(item, columnName, toggleItemState, itemState, allowExpand = true) {
        const icon = {
            pool: 'tasks',
            operation: 'code',
        };

        const empty = allowExpand && itemState ? itemState.empty : true;
        const expanderClass = block('table-row-expander', {empty});
        const expanderClassIcon = block('table-row-expander-icon', {empty});

        const expanderIcon = itemState && (
            <Icon
                className={expanderClassIcon}
                awesome={itemState.collapsed ? 'angle-down' : 'angle-up'}
            />
        );

        return (
            <span onClick={empty ? undefined : toggleItemState} className={expanderClass}>
                {item.type !== 'operation' && expanderIcon}
                <span
                    className={block('operation-icon', {
                        type: item.type,
                    })}
                    title={item.type}
                >
                    {icon[item.type] ? <Icon awesome={icon[item.type]} /> : null}
                </span>
            </span>
        );
    }

    static renderName(item, tab, cluster, currentPool) {
        const isCurrentPool = item.name === currentPool.name;
        const linkText = {
            pool: item.incomplete ? '' : item.name,
            operation: item.id,
        };

        if (item.type === 'pool') {
            if (isCurrentPool) {
                return <FormattedText text={linkText[item.type]} />;
            } else {
                const params = qs.parse(window.location.search.slice(1));
                const text = linkText[item.type];
                const state = {
                    ...params,
                    tab,
                    cluster,
                    pool: item.name,
                    page: Page.SCHEDULING,
                    filter: '',
                };
                return <FormattedLink text={text} state={state} theme="primary" routed />;
            }
        } else if (item.type === 'operation') {
            const url = `/${cluster}/operations/${item.id}`;
            return <Link url={url}>{linkText[item.type]}</Link>;
        } else {
            return <FormattedText text={item.name} />;
        }
    }

    static renderEphemeralIcon(item) {
        return (
            item.isEphemeral && (
                <Tooltip content="Ephemeral pool" className={block('ephemeral-icon')}>
                    <Icon awesome="ghost" />
                </Tooltip>
            )
        );
    }

    static renderDominantResource(item) {
        return hammer.format['ReadableField'](item.dominantResource);
    }

    static renderMinShare(item) {
        return Overview.renderRatio(item.minShareRatio);
    }

    renderNameCell = (item, ...rest) => {
        const {cluster, currentPool, changePool, itemsMaxDepth} = this.props;
        const allowExpand = item.name !== currentPool.name;

        return (
            <span
                className={block('name-content', {
                    level: item.level,
                    'max-depth': itemsMaxDepth,
                })}
            >
                {Overview.renderType(item, ...rest, allowExpand)}
                <span className={block('name-content-name')}>
                    {Overview.renderName(item, Tab.OVERVIEW, cluster, currentPool, changePool)}
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

    get tableSettings() {
        const {treeState} = this.props;

        return {
            treeState,
            css: block(),
            theme: 'light',
            striped: false,
            tableId: SCHEDULING_POOL_TREE_TABLE_ID,
            tree: true,
            columns: {
                items: poolsTableItems,
                sets: {
                    default: {
                        items: [
                            'name',
                            'FI',
                            'weight',
                            'fair_share_usage',
                            'fair_share',
                            'usage',
                            'demand',
                            'min_share',
                            'operation_overview',
                            'dominant_resource',
                            'actions',
                        ],
                    },
                },
                mode: 'default',
            },
            templates: {
                name: this.renderNameCell,
                mode: Overview.renderMode,
                FI: Overview.renderFifoIndex,
                weight: Overview.renderWeight,
                fair_share: Overview.renderColumnAsRatio,
                usage: Overview.renderColumnAsRatio,
                demand: Overview.renderColumnAsRatio,
                min_share: Overview.renderMinShare,
                fair_share_usage: Overview.renderFairShareUsage,
                dominant_resource: Overview.renderDominantResource,
                operation_overview: Overview.renderOperationOverview,
                actions: this.renderActions,
            },
            computeKey(item) {
                return item.key;
            },
        };
    }

    renderToolbar() {
        return (
            <Sticky topOffset={-HEADER_HEIGHT}>
                {({isSticky}) => (
                    <div className={block('toolbar', {sticky: isSticky})}>
                        <SchedulingOverviewToolbar {...this.props} />
                    </div>
                )}
            </Sticky>
        );
    }

    rowClassName = (item) => {
        const {currentPool} = this.props;
        return item.name !== currentPool?.name ? undefined : block('current-row');
    };

    render() {
        const {items, treeStateExpanded, isInitialLoading} = this.props;

        return (
            <ErrorBoundary>
                <div className={block(null, 'elements-section')}>
                    <SchedulingStaticConfiguration onToggleCollapsedState={fireResizeEvent} />
                    <StickyContainer>
                        {this.renderToolbar()}
                        <SchedulingOperationsError />
                        <ResetExpandedPoolsOnTreeChange>
                            <ElementsTable
                                {...this.tableSettings}
                                treeStateExpanded={treeStateExpanded}
                                items={items}
                                rowClassName={this.rowClassName}
                                onItemToggleState={this.onItemToggleState}
                                isLoading={isInitialLoading}
                            />
                        </ResetExpandedPoolsOnTreeChange>
                    </StickyContainer>
                </div>
            </ErrorBoundary>
        );
    }

    onItemToggleState = (poolPath, collapsed) => {
        const {setExpandedPool} = this.props;
        const parts = poolPath.split('/');
        const poolName = parts[parts.length - 1];

        setExpandedPool(poolName, !collapsed);
    };
}

const mapStateToProps = (state) => {
    const filter = getSchedulingFilter(state);
    const items = getTableItems(state);
    const itemsMaxDepth = getSchedulingOverviewMaxDepth(state);
    const cluster = getCluster(state);
    const currentPool = getCurrentPool(state);
    const treeState = getSchedulingTreeState(state);
    const isRoot = getIsRoot(state);

    const isInitialLoading = getSchedulingIsInitialLoading(state);

    return {
        cluster,
        filter,
        items,
        itemsMaxDepth,
        currentPool,
        treeState,
        treeStateExpanded: isRoot || !items[0] ? undefined : [items[0].key],
        abcServiceFilter: getSchedulingAbcFilter(state),
        isInitialLoading,
    };
};

const mapDispatchToProps = {
    changePool,
    openPoolDeleteModal,
    schedulingSetFilter,
    openEditModal,
    changeTableTreeState,
    schedulingSetAbcFilter,
    setExpandedPool,
    getSchedulingOperationsCount,
    setLoadAllOperations,
    getPoolPathsByName,
};

function fireResizeEvent() {
    setTimeout(() => window.dispatchEvent(new Event('resize')), 500);
}

const OverviewConnected = connect(mapStateToProps, mapDispatchToProps)(Overview);

export default OverviewConnected;

export function OverviewWithRum() {
    const isFinalState = useSelector(getSchedulingIsFinalLoadingState);

    useAppRumMeasureStart({
        type: RumMeasureTypes.SCHEDULING_OVERVIEW,
        additionalStartType: RumMeasureTypes.SCHEDULING,
        startDeps: [isFinalState],
        allowStart: ([isFinal]) => {
            return !isFinal;
        },
    });

    useRumMeasureStop({
        type: RumMeasureTypes.SCHEDULING_OVERVIEW,
        stopDeps: [isFinalState],
        allowStop: ([isFinal]) => {
            return isFinal;
        },
    });

    return <OverviewConnected />;
}

function ResetExpandedPoolsOnTreeChange({children}) {
    const dispatch = useDispatch();
    const tree = useSelector(getTree);
    /**
     * The component is required to reset inner state of ElementsTable by recreate it when tree is changed.
     * Also it resets state when the tab is changed back from 'Details'
     * These resets are required to sync store.getState().schedulingOperations.expandedPools and state of ElementsTable
     * to correctly calculate current max depth of items (see getSchedulingOverviewMaxDepth)
     */
    React.useEffect(() => {
        dispatch(resetExpandedPools(tree));
    }, [tree]);

    return <React.Fragment key={tree}>{children}</React.Fragment>;
}

class SchedulingOverviewToolbar extends React.PureComponent {
    state = {
        confirmExpandDialogVisible: false,
    };

    handleFilterChange = (value) => this.props.schedulingSetFilter(value);
    handleExpand = () => {
        const opCount = this.props.getSchedulingOperationsCount();
        if (opCount <= 2000) {
            this.onConfirmExpand();
        } else {
            this.setConfirmDialogVisibility(true);
        }
    };
    onConfirmExpand = () => {
        const {setLoadAllOperations} = this.props;
        setLoadAllOperations(true);
        this.props.changeTableTreeState('expanded');
    };
    handleCollapse = () => {
        const {setLoadAllOperations} = this.props;
        setLoadAllOperations(true);
        this.props.changeTableTreeState('collapsed');
    };

    onAbcServiceFilter = (abcService) => {
        const {slug} = abcService || {};
        this.props.schedulingSetAbcFilter(slug);
    };

    setConfirmDialogVisibility = (confirmExpandDialogVisible) => {
        this.setState({confirmExpandDialogVisible});
    };

    renderConfirmExpandDialog() {
        const {confirmExpandDialogVisible} = this.state;
        return !confirmExpandDialogVisible ? null : (
            <Dialog open={true}>
                <Dialog.Header caption={'Confirmation of "Expand all"'} />
                <Dialog.Body>
                    To display the expanded tree it is required to load all running operations, it
                    might be a reason of less responsiveness UI.
                    <div>Are you sure you want to load all running operations?</div>
                </Dialog.Body>
                <Dialog.Footer
                    onClickButtonApply={() => {
                        this.setConfirmDialogVisibility(false);
                        this.onConfirmExpand();
                    }}
                    onClickButtonCancel={() => this.setConfirmDialogVisibility(false)}
                    textButtonCancel={'No'}
                    textButtonApply={'Yes, please expand'}
                />
            </Dialog>
        );
    }

    render() {
        const {
            filter,
            abcServiceFilter: {slug},
            currentPool,
        } = this.props;

        return (
            <React.Fragment>
                {this.renderConfirmExpandDialog()}
                <Filter
                    key={currentPool?.name}
                    size="m"
                    value={filter}
                    placeholder="Filter..."
                    className={block('filter')}
                    onChange={this.handleFilterChange}
                />

                {UIFactory.renderControlAbcService({
                    className: block('abc-filter'),
                    value: {slug},
                    onChange: this.onAbcServiceFilter,
                })}

                <Button size="s" theme="normal" title="Expand All" onClick={this.handleExpand}>
                    <Icon awesome="arrow-to-bottom" />
                </Button>

                <Button size="s" theme="normal" title="Collapse All" onClick={this.handleCollapse}>
                    <Icon awesome="arrow-to-top" />
                </Button>
            </React.Fragment>
        );
    }
}
