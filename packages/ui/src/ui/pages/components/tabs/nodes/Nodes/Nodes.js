import {StickyContainer, Sticky} from 'react-sticky';
import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import hammer from '../../../../../common/hammer';
import {compose} from 'redux';
import cn from 'bem-cn-lite';
import _ from 'lodash';

import {Select} from '@gravity-ui/uikit';

import ColumnSelector from '../../../../../components/ColumnSelector/ColumnSelector';
import ElementsTable from '../../../../../components/ElementsTable/ElementsTable';
import UnbanModal from '../../../../../pages/components/UnbanModal/UnbanModal';
import Radiobutton from '../../../../../components/RadioButton/RadioButton';
import TableInfo from '../../../../../pages/components/TableInfo/TableInfo';
import BanModal from '../../../../../pages/components/BanModal/BanModal';
import Dropdown from '../../../../../components/Dropdown/Dropdown';
import Button from '../../../../../components/Button/Button';
import Filter from '../../../../../components/Filter/Filter';
import Icon from '../../../../../components/Icon/Icon';
import Loader from '../../../../../components/Loader/Loader';

import ResourcesLimitModal from '../NodeActions/ResourcesLimitsModal/ResourcesLimitsModal';
import LoadDataHandler from '../../../../../components/LoadDataHandler/LoadDataHandler';
import ErrorBoundary from '../../../../../components/ErrorBoundary/ErrorBoundary';
import FiltersPresets from '../FilterPresets/FiltersPresets';
import DisableModal from '../NodeActions/DisableModal';
import SetupModal from '../SetupModal/SetupModal';
import NodeCard from '../NodeCard/NodeCard';

import {
    getVisibleNodes,
    getComponentNodesTableProps,
} from '../../../../../store/selectors/components/nodes/nodes';
import {getSelectedColumns} from '../../../../../store/selectors/settings';
import {getSettingsEnableSideBar} from '../../../../../store/selectors/settings-ts';
import {defaultColumns} from '../../../../../utils/components/nodes/tables';
import withVisible from '../../../../../hocs/withVisible';
import Updater from '../../../../../utils/hammer/updater';
import {isPaneSplit} from '../../../../../utils';
import {
    changeContentMode,
    changeHostFilter,
    changeNodeType,
    getNodes,
    handleColumnsChange,
} from '../../../../../store/actions/components/nodes/nodes';

import {banNode, unbanNode} from '../../../../../store/actions/components/nodes/actions/ban-unban';
import {splitScreen as splitScreenAction, mergeScreen} from '../../../../../store/actions/global';
import {HEADER_HEIGHT, KeyCode} from '../../../../../constants/index';
import {
    CONTENT_MODE_OPTIONS,
    CONTENT_MODE_ITEMS,
    SPLIT_TYPE,
    CONTENT_MODE,
    POLLING_INTERVAL,
    NODE_TYPE_ITEMS,
} from '../../../../../constants/components/nodes/nodes';

import DecommissionNodeModal from '../NodeActions/DecommissionNodeModal';

import './Nodes.scss';

const updater = new Updater();
const block = cn('components-nodes');

class Nodes extends Component {
    static propTypes = {
        // from connect
        loading: PropTypes.bool.isRequired,
        loaded: PropTypes.bool.isRequired,
        error: PropTypes.bool.isRequired,
        errorData: PropTypes.object.isRequired,

        contentMode: PropTypes.oneOf(CONTENT_MODE_OPTIONS).isRequired,
        nodes: PropTypes.arrayOf(PropTypes.object).isRequired,
        initialLoading: PropTypes.bool.isRequired,
        totalItems: PropTypes.number.isRequired,
        hostFilter: PropTypes.string.isRequired,
        resourcesHost: PropTypes.string.isRequired,
        showingItems: PropTypes.number.isRequired,
        selectedColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
        splitScreen: PropTypes.shape({
            isSplit: PropTypes.bool.isRequired,
            paneClassNames: PropTypes.array.isRequired,
            type: PropTypes.string.isRequired,
        }).isRequired,
        sideBarEnabled: PropTypes.bool.isRequired,
        nodeType: PropTypes.string.isRequired,

        changeContentMode: PropTypes.func.isRequired,
        splitScreenAction: PropTypes.func.isRequired,
        changeHostFilter: PropTypes.func.isRequired,
        mergeScreen: PropTypes.func.isRequired,
        getNodes: PropTypes.func.isRequired,
        handleColumnsChange: PropTypes.func.isRequired,

        banNode: PropTypes.func.isRequired,
        unbanNode: PropTypes.func.isRequired,

        // from hoc
        visible: PropTypes.bool.isRequired,
        handleClose: PropTypes.func.isRequired,
        handleShow: PropTypes.func.isRequired,
        toggleVisible: PropTypes.func.isRequired,
    };

    state = {
        preset: '',
        activeNodeHost: null,
        selectedColumns: this.props.selectedColumns,
        nodes: [],
    };

    componentDidMount() {
        const {getNodes} = this.props;

        updater.add('components/nodes', getNodes, POLLING_INTERVAL);
    }

    componentDidUpdate(prevProps) {
        if (this.props.loading && !prevProps.loading) {
            updater.remove('components/nodes');
        }
        if (!this.props.loading && prevProps.loading) {
            updater.add('components/nodes', getNodes, POLLING_INTERVAL, {skipInitialCall: true});
        }
    }

    componentWillUnmount() {
        updater.remove('components/nodes');
    }

    get allColumns() {
        const {nodesTableProps} = this.props;
        const {selectedColumns} = this.state;

        const columns = _.filter(_.keys(nodesTableProps.columns.items), (key) => key !== 'actions');

        return _.map(columns, (column) => ({
            name: column,
            checked: _.includes(selectedColumns, column),
            caption: hammer.format['ReadableField'](column),
        }));
    }

    get selectedIndex() {
        const {nodes, splitScreen} = this.props;
        const {activeNodeHost} = this.state;

        const hasSplit = isPaneSplit(splitScreen, SPLIT_TYPE);

        return hasSplit ? this.getSelectedIndex(activeNodeHost, nodes) : -1;
    }

    getSelectedIndex = _.memoize((activeNodeHost, nodes) =>
        (nodes ?? []).findIndex((node) => activeNodeHost === node.host),
    );

    handlePresetChange = ({name}) => this.setState({preset: name});

    handleItemClick = (node, index) => {
        const {nodes, sideBarEnabled, splitScreenAction} = this.props;

        if (sideBarEnabled) {
            const paneClassNames = [block('node-pane'), block('info-pane')];

            this.setState({activeNodeHost: nodes[index].host, nodes});
            splitScreenAction(SPLIT_TYPE, paneClassNames);
        }
    };

    handleColumnsChange = ({items}) => {
        const {handleColumnsChange} = this.props;

        const selectedItems = _.filter(items, (column) => column.checked);
        const selectedColumns = [..._.map(selectedItems, (column) => column.name), 'actions'];

        this.setState({selectedColumns});
        handleColumnsChange(selectedColumns);
    };

    handleKeyDown = (evt) => {
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
        const {getNodes, handleClose} = this.props;

        await handleClose();
        getNodes();
    };

    handleContentModeChange = async (...args) => {
        const {changeContentMode, getNodes} = this.props;

        await changeContentMode(...args);
        getNodes();
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

    renderFilters(sticky, split) {
        const {
            changeHostFilter,
            changeNodeType,
            hostFilter,
            contentMode,
            toggleVisible,
            totalItems,
            showingItems,
            nodeType,
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
                    <Icon awesome="filter" /> Filter
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

                <Select
                    className={block('filters-item')}
                    value={[nodeType]}
                    options={NODE_TYPE_ITEMS}
                    onUpdate={(vals) => changeNodeType(vals[0])}
                    label="Node type:"
                />
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
                                    onChange={this.handleContentModeChange}
                                    name="components-nodes-content-mode"
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

    renderModals() {
        const {resourcesHost, banNode, unbanNode} = this.props;

        return (
            <Fragment>
                <BanModal ban={banNode} label="You are about to ban node" />
                <UnbanModal unban={unbanNode} label="You are about to unban node" />
                <DisableModal />
                <ResourcesLimitModal key={resourcesHost} />
            </Fragment>
        );
    }

    render() {
        const {visible} = this.props;
        const {preset} = this.state;

        return (
            <ErrorBoundary>
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

                        {this.renderModals()}
                    </div>
                </LoadDataHandler>
                <DecommissionNodeModal />
            </ErrorBoundary>
        );
    }
}

const mapStateToProps = (state) => {
    const {splitScreen} = state.global;
    const {contentMode, nodes, loading, loaded, error, errorData, hostFilter, nodeType} =
        state.components.nodes.nodes;
    const {host: resourcesHost} = state.components.nodes.resourcesLimit;

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
        resourcesHost,
        hostFilter,
        contentMode,
        splitScreen,
        initialLoading,
        nodesTableProps,
        sideBarEnabled,
        nodeType,
    };
};

const mapDispatchToProps = {
    changeContentMode,
    splitScreenAction,
    changeHostFilter,
    changeNodeType,
    mergeScreen,
    getNodes,
    handleColumnsChange,

    banNode,
    unbanNode,
};

export default compose(connect(mapStateToProps, mapDispatchToProps), withVisible)(Nodes);
