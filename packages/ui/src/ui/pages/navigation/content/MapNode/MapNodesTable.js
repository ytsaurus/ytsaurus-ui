import {Checkbox} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import findIndex_ from 'lodash/findIndex';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {batch, connect} from 'react-redux';
import hammer from '../../../../common/hammer';
import ElementsTableBase from '../../../../components/ElementsTable/ElementsTable';
import withKeyboardNavigation from '../../../../components/ElementsTable/hocs/withKeyboardNavigation';
import {
    FormattedLink,
    FormattedTextOrLink,
    printColumnAsBytes,
    printColumnAsNumber,
} from '../../../../components/formatters';
import Icon from '../../../../components/Icon/Icon';
import Link from '../../../../components/Link/Link';
import {MapNodeIcon} from '../../../../components/MapNodeIcon/MapNodeIcon';
import {Tooltip} from '../../../../components/Tooltip/Tooltip';
import TTLInfo from '../../../../components/TTLInfo/TTLInfo';
import WarningIcon from '../../../../components/WarningIcon/WarningIcon';
import {LOADING_STATUS, Page} from '../../../../constants/index';
import {NAVIGATION_MAP_NODE_TABLE_ID} from '../../../../constants/navigation';
import {ROOT_POOL_NAME, SchedulingTab} from '../../../../constants/scheduling';
import {itemNavigationAllowed} from '../../../../pages/navigation/Navigation/ContentViewer/helpers';
import {RumMeasureTypes} from '../../../../rum/rum-measure-types';
import {useRumMeasureStop} from '../../../../rum/RumUiContext';
import {
    navigateParent,
    setMode,
    updatePath,
    updateView,
} from '../../../../store/actions/navigation';
import {setSelectedItem} from '../../../../store/actions/navigation/content/map-node';
import {showTableEraseModal} from '../../../../store/actions/navigation/modals/table-erase-modal';
import {
    showTableMergeModal,
    showTableSortModal,
} from '../../../../store/actions/navigation/modals/table-merge-sort-modal';
import {useSelector} from '../../../../store/redux-hooks';
import {getTransaction} from '../../../../store/selectors/navigation';
import {
    getContentMode,
    getLoadState,
    getPreparedTableColumns,
    getSelected,
    getSelectedIndex,
    getSortedNodes,
} from '../../../../store/selectors/navigation/content/map-node';
import {makeFlowLink} from '../../../../utils/app-url';
import {isLinkToTrashNode} from '../../../../utils/navigation/isLinkToTrashNode';
import {isPipelineNode} from '../../../../utils/navigation/isPipelineNode';
import {isTrashNode} from '../../../../utils/navigation/isTrashNode';
import {isFinalLoadingStatus, showErrorPopup} from '../../../../utils/utils';
import AccountLink from '../../../accounts/AccountLink';
import './MapNodesTable.scss';
import PathActions from './PathActions';

const block = cn('map-nodes-table');
const ElementsTable = withKeyboardNavigation(ElementsTableBase);

class MapNodesTable extends Component {
    static propTypes = {
        columns: PropTypes.objectOf(
            PropTypes.shape({
                sort: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
                caption: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
                align: PropTypes.string,
                get: PropTypes.func,
            }),
        ),
        contentMode: PropTypes.string.isRequired,
        selected: PropTypes.object.isRequired,
        loadState: PropTypes.string.isRequired,
        nodes: PropTypes.array.isRequired,
        selectedIndex: PropTypes.number.isRequired,
        transaction: PropTypes.string,

        setSelectedItem: PropTypes.func.isRequired,
        navigateParent: PropTypes.func.isRequired,
        updatePath: PropTypes.func.isRequired,
        updateView: PropTypes.func.isRequired,
    };

    static renderTrash(linkState) {
        return <FormattedLink text="trash" state={linkState} theme="primary" />;
    }

    static renderName(item) {
        return (
            <div className={block('name-cell')}>
                <div className={block('name-cell-text')}>{MapNodesTable.renderNameImpl(item)}</div>
                <div className={block('name-cell-tags')}>{MapNodesTable.renderTags(item)}</div>
            </div>
        );
    }

    static renderTags(item) {
        return (
            <TTLInfo
                attributes={item.$attributes}
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    return true;
                }}
            />
        );
    }

    static renderNameImpl(item) {
        if (isTrashNode(item)) {
            return MapNodesTable.renderTrash(item.pathState);
        } else if (isLinkToTrashNode(item)) {
            return MapNodesTable.renderTrash(item.targetPathState);
        }

        const type = item.type;

        const textOrLink = (
            <FormattedTextOrLink
                text={item.caption}
                state={item.pathState}
                asLink={itemNavigationAllowed(item)}
                asHTML
                title={item.title}
                theme="primary"
                className={block('name', 'unipika-wrapper')}
            />
        );

        const name = !item.parsedPathError ? (
            textOrLink
        ) : (
            <Tooltip content={<span>{item.parsedPathError.message} </span>}>
                <WarningIcon /> {textOrLink}
            </Tooltip>
        );

        if (type === 'scheduler_pool') {
            const poolTreeIndex = findIndex_(
                item.parsedPath.fragments,
                (fragment) => fragment.name === 'pool_trees',
            );

            const pool = item.parsedPath.fragments[poolTreeIndex + 2] ? item.name : ROOT_POOL_NAME;
            const poolTree = item.parsedPath.fragments[poolTreeIndex + 1].name;

            const url = `${Page.SCHEDULING}/${SchedulingTab.OVERVIEW}?pool=${pool}&tree=${poolTree}`;
            const arrow = <span>&#10142;</span>;
            const goToLink = (
                <Link url={url} title={url}>
                    <span>go to scheduling</span>
                </Link>
            );

            return (
                <span>
                    {name}&nbsp;{arrow}&nbsp;{goToLink}
                </span>
            );
        }

        const arrow = <span>&#10142;</span>;

        if (type === 'link') {
            const target = (
                <FormattedTextOrLink
                    text={item.targetPath}
                    state={item.targetPathState}
                    asLink={itemNavigationAllowed(item)}
                    theme="primary"
                />
            );

            const viewLink = (
                <FormattedLink text="view link" state={item.linkPathState} theme="ghost" />
            );

            return (
                <span>
                    {name}&nbsp;{viewLink}&nbsp;{arrow}&nbsp;{target}
                </span>
            );
        }

        if (isPipelineNode(item.$attributes)) {
            return (
                <span>
                    {name}&nbsp;{arrow}&nbsp;
                    <Link url={makeFlowLink({path: item.path})} routed>
                        got to flow
                    </Link>
                </span>
            );
        }

        return <span>{name}</span>;
    }

    static renderLocks(item) {
        return (
            item.locks > 0 && (
                <span title={item.locks + ' locks'}>
                    <Icon face="solid" awesome="lock" />
                </span>
            )
        );
    }

    static renderModificationTime(item) {
        return hammer.format['DateTime'](item.modified, {format: 'full'});
    }

    static renderCreationTime(item) {
        return hammer.format['DateTime'](item.created, {format: 'full'});
    }

    static renderAccount(item, columnName) {
        return <AccountLink account={item[columnName]} inline />;
    }

    get hotkeys() {
        const {navigateParent} = this.props;

        return [
            {keys: 'h, ctrl+left', handler: navigateParent, scope: 'all'},
            {keys: 'space', handler: this.onSpaceHotkey, scope: 'all'},
        ];
    }

    get defaultColumns() {
        return [
            'icon',
            'name',
            'locks',
            'account',
            'disk_space',
            'row_count',
            'modification_time',
            'creation_time',
        ];
    }

    get resourcesColumns() {
        return [
            'icon',
            'name',
            'master_memory',
            'tablet_static_memory',
            'tablet_count',
            'disk_space',
            'data_weight',
            'chunk_count',
            'node_count',
            'row_count',
        ];
    }

    get columns() {
        return {
            sets: {
                default: {
                    items: ['chooser', ...this.defaultColumns, 'actions'],
                },
                resources: {
                    items: ['chooser', ...this.resourcesColumns, 'actions'],
                },
            },
        };
    }

    get tableProps() {
        return {
            css: 'map-node_' + this.props.contentMode,
            theme: 'light',
            striped: false,
            tableId: NAVIGATION_MAP_NODE_TABLE_ID,
            computeKey: (item) => item.name,
            onItemClick: this.onItemClick,
            columns: this.columns,
            templates: {
                chooser: this.renderChooser,
                icon: (node) => <MapNodeIcon node={node} />,
                name: MapNodesTable.renderName,
                locks: MapNodesTable.renderLocks,
                modification_time: MapNodesTable.renderModificationTime,
                creation_time: MapNodesTable.renderCreationTime,
                row_count: this.renderRowCount,
                chunk_count: this.printColumnAsNumber,
                node_count: this.printColumnAsNumber,
                disk_space: this.printColumnAsBytes,
                data_weight: this.printColumnAsBytes,
                tablet_static_memory: this.printColumnAsBytes,
                master_memory: this.printColumnAsBytes,
                tablet_count: this.printColumnAsNumber,
                account: MapNodesTable.renderAccount,
                actions: this.renderActions,
            },
        };
    }

    onItemClick = (item, _index, evt) => {
        if (evt?.target?.classList?.contains?.('map-node_default__table-item_type_chooser')) {
            this.onChooserClick(evt, item);
        } else if (item.parsedPathError) {
            showErrorPopup(item.parsedPathError, {hideOopsMsg: true, disableLogger: true});
        } else if (itemNavigationAllowed(item)) {
            batch(() => {
                this.props.updatePath(item.path);
                this.props.setMode('auto');
            });
        }
    };

    onSpaceHotkey = (evt, info, {item}) => {
        this.onChooserClick(evt, item);
    };

    onChooserClick = (evt, item) => {
        const {
            nativeEvent: {shiftKey},
        } = evt;
        this.props.setSelectedItem(item.name, shiftKey);
        evt.stopPropagation();
    };

    renderChooser = (item) => {
        const {selected} = this.props;
        const value = selected[item.name];

        return (
            <Checkbox
                id={`item_${item.name}`}
                size="l"
                key={value}
                checked={value}
                onChange={(evt) => {
                    this.onChooserClick(evt, item);
                }}
            >
                <span />
            </Checkbox>
        );
    };

    renderActions = (item) => {
        return <PathActions item={item} />;
    };

    renderRowCount = (item, columnName) => {
        const column = this.props.columns[columnName];
        return (item.dynamic ? '≈ ' : '') + hammer.format['Number'](column.get(item));
    };

    printColumnAsBytes = printColumnAsBytes.bind(this);
    printColumnAsNumber = printColumnAsNumber.bind(this);

    rowClassName = ({dynamic}) => {
        return dynamic ? block('row', {dyntable: true}) : undefined;
    };

    render() {
        const {nodes, columns, contentMode, loadState, selectedIndex} = this.props;

        const settings = {
            ...this.tableProps,
            items: nodes,
            columns: {
                ...this.tableProps.columns,
                items: columns,
                mode: contentMode,
            },
        };

        return (
            columns && (
                <div className={block()}>
                    <ElementsTable
                        {...settings}
                        isLoading={loadState === LOADING_STATUS.LOADING}
                        selectedIndex={selectedIndex}
                        hotkeys={this.hotkeys}
                        key={selectedIndex}
                        rowClassName={this.rowClassName}
                    />
                </div>
            )
        );
    }
}

function mapStateToProps(state) {
    return {
        loadState: getLoadState(state),
        columns: getPreparedTableColumns(state),
        transaction: getTransaction(state),
        contentMode: getContentMode(state),
        nodes: getSortedNodes(state),
        selected: getSelected(state),
        selectedIndex: getSelectedIndex(state),
    };
}

const mapDispatchToProps = {
    setSelectedItem,
    navigateParent,
    updateView,
    updatePath,
    setMode,
    showTableEraseModal,
    showTableSortModal,
    showTableMergeModal,
};

const MapNodesTableConnected = connect(mapStateToProps, mapDispatchToProps)(MapNodesTable);

export default function MapNodesTableWithRum() {
    const loadState = useSelector(getLoadState);
    const nodes = useSelector(getSortedNodes);

    useRumMeasureStop({
        type: RumMeasureTypes.NAVIGATION_CONTENT_MAP_NODE,
        stopDeps: [nodes, loadState],
        allowStop: ([nodes, loadState]) => {
            return Boolean(nodes) && isFinalLoadingStatus(loadState);
        },
    });

    return <MapNodesTableConnected />;
}
