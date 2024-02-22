import cn from 'bem-cn-lite';
import filter_ from 'lodash/filter';
import includes_ from 'lodash/includes';
import keys_ from 'lodash/keys';
import map_ from 'lodash/map';
import memoize_ from 'lodash/memoize';
import React from 'react';
import {ConnectedProps, connect, useDispatch, useSelector} from 'react-redux';
import {Sticky, StickyContainer} from 'react-sticky';
import {compose} from 'redux';
import hammer from '../../../../../common/hammer';

import Button from '../../../../../components/Button/Button';
import ColumnSelector from '../../../../../components/ColumnSelector/ColumnSelector';
import Dropdown from '../../../../../components/Dropdown/Dropdown';
import ElementsTable from '../../../../../components/ElementsTable/ElementsTable';
import Filter from '../../../../../components/Filter/Filter';
import Icon from '../../../../../components/Icon/Icon';
import Loader from '../../../../../components/Loader/Loader';
import Radiobutton from '../../../../../components/RadioButton/RadioButton';
import TableInfo from '../../../../../pages/components/TableInfo/TableInfo';

import ErrorBoundary from '../../../../../components/ErrorBoundary/ErrorBoundary';
import LoadDataHandler from '../../../../../components/LoadDataHandler/LoadDataHandler';
import FiltersPresets from '../FilterPresets/FiltersPresets';
import NodeCard from '../NodeCard/NodeCard';
import SetupModal from '../SetupModal/SetupModal';

import {ComponentsNodeTypeSelector} from '../../../../../pages/system/Nodes/NodeTypeSelector';

import withVisible, {WithVisibleProps} from '../../../../../hocs/withVisible';
import {useUpdaterWithMemoizedParams} from '../../../../../hooks/use-updater';
import {
    changeContentMode,
    changeHostFilter,
    getNodes,
    handleColumnsChange,
} from '../../../../../store/actions/components/nodes/nodes';
import type {NodesState} from '../../../../../store/reducers/components/nodes/nodes/nodes';
import {
    getComponentNodesFiltersCount,
    getComponentNodesTableProps,
    getComponentsNodesNodeTypes,
    getRequiredAttributes,
    getVisibleNodes,
} from '../../../../../store/selectors/components/nodes/nodes';
import {getSelectedColumns} from '../../../../../store/selectors/settings';
import {getSettingsEnableSideBar} from '../../../../../store/selectors/settings-ts';
import {isPaneSplit} from '../../../../../utils';
import {defaultColumns} from '../../../../../utils/components/nodes/tables';

import {
    CONTENT_MODE,
    CONTENT_MODE_ITEMS,
    SPLIT_TYPE,
} from '../../../../../constants/components/nodes/nodes';
import {HEADER_HEIGHT, KeyCode} from '../../../../../constants/index';
import {mergeScreen, splitScreen as splitScreenAction} from '../../../../../store/actions/global';
import {RootState} from '../../../../../store/reducers';

import {NodeMaintenanceModal} from '../../../NodeMaintenanceModal/NodeMaintenanceModal';

import './Nodes.scss';

const block = cn('components-nodes');

type ReduxProps = ConnectedProps<typeof connector>;

type State = {
    preset: string;
    activeNodeHost?: string;
    selectedColumns: ReduxProps['selectedColumns'];
    nodes: Array<unknown>;
};

function NodesUpdater() {
    const dispatch = useDispatch();

    const attributes = useSelector(getRequiredAttributes);
    const nodeTypes = useSelector(getComponentsNodesNodeTypes);

    const updateFn = React.useCallback(
        (...args: Parameters<typeof getNodes>) => {
            dispatch(getNodes(...args));
        },
        [dispatch],
    );

    useUpdaterWithMemoizedParams(updateFn, undefined, {attributes, nodeTypes});

    return null;
}

class Nodes extends React.Component<ReduxProps & WithVisibleProps, State> {
    state: State = {
        preset: '',
        activeNodeHost: undefined,
        selectedColumns: this.props.selectedColumns,
        nodes: [],
    };

    get allColumns() {
        const {nodesTableProps} = this.props;
        const {selectedColumns} = this.state;

        const columns = filter_(keys_(nodesTableProps.columns.items), (key) => key !== 'actions');

        return map_(columns, (column) => ({
            name: column,
            checked: includes_(selectedColumns, column),
            caption: hammer.format['ReadableField'](column),
        }));
    }

    get selectedIndex() {
        const {nodes, splitScreen} = this.props;
        const {activeNodeHost} = this.state;

        const hasSplit = isPaneSplit(splitScreen, SPLIT_TYPE);

        return hasSplit ? this.getSelectedIndex(activeNodeHost, nodes) : -1;
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    getSelectedIndex = memoize_(
        (activeNodeHost: State['activeNodeHost'], nodes: ReduxProps['nodes'] = []) =>
            nodes.findIndex((node) => activeNodeHost === node.host),
    );

    handlePresetChange = ({name}: {name: string}) => this.setState({preset: name});

    handleItemClick = (_node: ReduxProps['nodes'][number], index: number) => {
        const {nodes, sideBarEnabled, splitScreenAction} = this.props;

        if (sideBarEnabled) {
            const paneClassNames = [block('node-pane'), block('info-pane')];

            this.setState({activeNodeHost: nodes[index].host, nodes});
            splitScreenAction(SPLIT_TYPE, paneClassNames);
        }
    };

    handleColumnsChange = ({items}: {items: Nodes['allColumns']}) => {
        const {handleColumnsChange} = this.props;

        const selectedItems = filter_(items, (column) => column.checked);
        const selectedColumns = [...map_(selectedItems, (column) => column.name), 'actions'];

        this.setState({selectedColumns});
        handleColumnsChange(selectedColumns);
    };

    handleKeyDown = (evt: React.KeyboardEvent<HTMLInputElement>) => {
        const key = evt.keyCode;

        switch (key) {
            case KeyCode.ARROW_DOWN: {
                evt.preventDefault();
                this.selectNextSuggestion();
                break;
            }
            case KeyCode.ARROW_UP: {
                evt.preventDefault();
                this.selectPrevSuggestion();
                break;
            }
            case KeyCode.ESCAPE: {
                evt.preventDefault();
                this.props.mergeScreen();
                break;
            }
        }
    };

    handleSetupModalClose = async () => {
        const {handleClose} = this.props;

        await handleClose();
    };

    handleContentModeChange = async (value: string) => {
        const {changeContentMode} = this.props;

        await changeContentMode(value as NodesState['contentMode']);
    };

    selectNextSuggestion() {
        const {nodes} = this.props;
        const index = this.selectedIndex;

        if (index >= 0 && index < nodes.length - 1) {
            this.setState({activeNodeHost: nodes[index + 1].host});
        }
    }

    selectPrevSuggestion() {
        const {nodes} = this.props;
        const index = this.selectedIndex;

        if (index > 0) {
            this.setState({activeNodeHost: nodes[index - 1].host});
        }
    }

    renderFilters(sticky: boolean, split: boolean) {
        const {
            changeHostFilter,
            hostFilter,
            contentMode,
            toggleVisible,
            totalItems,
            showingItems,
            filterCount,
        } = this.props;
        const isFiltered = totalItems !== showingItems;

        return (
            <div className={block('filters', {sticky, split})}>
                <Filter
                    className={block('filters-item')}
                    hasClear
                    value={hostFilter}
                    onChange={changeHostFilter}
                    placeholder="Filter hosts..."
                    pin={'round-round'}
                />

                <Button
                    className={block('filters-item')}
                    size="m"
                    onClick={toggleVisible}
                    selected={isFiltered}
                >
                    <Icon awesome="filter" /> Filter {filterCount}
                </Button>

                <Dropdown
                    className={block('filters-item')}
                    trigger="click"
                    directions={['bottom']}
                    button={
                        <Button disabled={contentMode !== CONTENT_MODE.CUSTOM} pin={'round-round'}>
                            <Icon awesome="table" face="light" />
                            Columns
                        </Button>
                    }
                    template={
                        <ColumnSelector
                            items={this.allColumns}
                            onChange={this.handleColumnsChange}
                            className={block('custom-column-selector')}
                        />
                    }
                />

                <ComponentsNodeTypeSelector className={block('filters-item')} />
            </div>
        );
    }

    renderOverview() {
        const {contentMode, loading, showingItems, splitScreen, totalItems} = this.props;
        const isSplit = isPaneSplit(splitScreen, SPLIT_TYPE);

        return (
            <Sticky topOffset={isSplit ? HEADER_HEIGHT * 2 : -HEADER_HEIGHT} relative={isSplit}>
                {(props) => {
                    const {isSticky} = props;
                    return (
                        <div
                            className={block('overview', {
                                sticky: isSticky,
                                split: isSplit,
                            })}
                        >
                            <div className={block('overview-top')}>
                                {this.renderFilters(isSticky, isSplit)}
                                <div className={block('spacer')} />
                                <Loader visible={loading} />
                                <TableInfo showingItems={showingItems} totalItems={totalItems} />
                            </div>

                            <div className={block('table-presets')}>
                                <Radiobutton
                                    size="m"
                                    value={contentMode}
                                    items={CONTENT_MODE_ITEMS}
                                    name="components-nodes-content-mode"
                                    onUpdate={this.handleContentModeChange}
                                />
                            </div>

                            <FiltersPresets onChange={this.handlePresetChange} />
                        </div>
                    );
                }}
            </Sticky>
        );
    }

    renderContent() {
        const {contentMode, nodes, splitScreen, initialLoading, mergeScreen, nodesTableProps} =
            this.props;
        const {activeNodeHost, selectedColumns} = this.state;

        const hasSplit = isPaneSplit(splitScreen, SPLIT_TYPE);

        const columns = {
            ...nodesTableProps.columns,
            sets: {
                ...nodesTableProps.columns.sets,
                custom: {items: selectedColumns},
            },
            mode: contentMode,
        };

        return (
            <div className={block('content', {split: hasSplit})}>
                <ElementsTable
                    {...nodesTableProps}
                    onItemClick={this.handleItemClick}
                    isLoading={initialLoading}
                    columns={columns}
                    items={nodes}
                    css={block()}
                    templates={nodesTableProps.templates}
                    selectedIndex={this.selectedIndex}
                />

                {hasSplit && (
                    <NodeCard
                        host={activeNodeHost}
                        handleClose={mergeScreen}
                        handleKeyDown={this.handleKeyDown}
                    />
                )}
            </div>
        );
    }

    render() {
        const {visible} = this.props;
        const {preset} = this.state;

        return (
            <ErrorBoundary>
                <NodesUpdater />
                <LoadDataHandler {...this.props}>
                    <div className={block()} onKeyDown={this.handleKeyDown} tabIndex={-1}>
                        <StickyContainer>
                            {this.renderOverview()}
                            {this.renderContent()}
                        </StickyContainer>

                        <SetupModal
                            key={preset}
                            visible={visible}
                            handleClose={this.handleSetupModalClose}
                        />

                        <NodeMaintenanceModal />
                    </div>
                </LoadDataHandler>
            </ErrorBoundary>
        );
    }
}

const mapStateToProps = (state: RootState) => {
    const {splitScreen} = state.global;
    const {contentMode, nodes, loading, loaded, error, errorData, hostFilter} =
        state.components.nodes.nodes;

    console.log(state);

    const visibleNodes = getVisibleNodes(state);
    const selectedColumns = getSelectedColumns(state) || defaultColumns;
    const initialLoading = loading && !loaded;

    const nodesTableProps = getComponentNodesTableProps(state);

    const sideBarEnabled = getSettingsEnableSideBar(state);

    return {
        loading,
        loaded,
        error,
        errorData,

        nodes: visibleNodes,
        totalItems: nodes.length,
        showingItems: visibleNodes.length,
        selectedColumns,
        hostFilter,
        contentMode,
        splitScreen,
        initialLoading,
        nodesTableProps,
        sideBarEnabled,
        nodeTypes: getComponentsNodesNodeTypes(state),
        filterCount: getComponentNodesFiltersCount(state),
    };
};

const mapDispatchToProps = {
    changeContentMode,
    splitScreenAction,
    changeHostFilter,
    mergeScreen,
    handleColumnsChange,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default compose(connector, withVisible)(Nodes);
