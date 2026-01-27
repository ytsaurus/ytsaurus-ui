import React from 'react';
import cn from 'bem-cn-lite';

import DataTable, {Column, Settings} from '@gravity-ui/react-data-table';
import {HelpMark, Progress} from '@gravity-ui/uikit';

import AccountLink from '../../../pages/accounts/AccountLink';
import ClickableAttributesButton from '../../../components/AttributesButton/ClickableAttributesButton';
import Button from '../../../components/Button/Button';
import ChartLink from '../../../components/ChartLink/ChartLink';
import ClipboardButton from '../../../components/ClipboardButton/ClipboardButton';
import ColumnHeader from '../../../components/ColumnHeader/ColumnHeader';
import DataTableYT from '../../../components/DataTableYT/DataTableYT';
import Icon from '../../../components/Icon/Icon';
import Link from '../../../components/Link/Link';
import {Tooltip} from '../../../components/Tooltip/Tooltip';
import {Health} from '../../../components/Health/Health';
import {STICKY_TOOLBAR_BOTTOM} from '../../../components/WithStickyToolbar/WithStickyToolbar';
// @ts-ignore
import hammer from '@ytsaurus/interface-helpers/lib/hammer';
import {BundleBalancerValue} from '../../../pages/tablet_cell_bundles/bundle/BundleGeneralMeta';
import type {TabletBundle} from '../../../store/reducers/tablet_cell_bundles';
import type {SortState} from '../../../types';
import type {OrderType} from '../../../utils/sort-helpers';
import {calcProgressProps} from '../../../utils/utils';

import './BundlesTable.scss';
import UIFactory from '../../../UIFactory';
import {ClusterUiConfig} from '../../../../shared/yt-types';
import {WaitForFont} from '../../../containers/WaitForFont/WaitForFont';

const block = cn('bundles-table');

const TABLE_SETTINGS: Settings = {
    displayIndices: false,
    stickyHead: DataTable.MOVING,
    stickyFooter: DataTable.MOVING,
    stickyTop: STICKY_TOOLBAR_BOTTOM,
    stickyBottom: 0,
    syncHeadOnResize: true,
    dynamicRender: true,
};

const COLUMN_TITLE: {[name: string]: string} = {
    bundle: 'Bundle / Node tag filter',
    tabletCells: 'Cells',
    uncompressed: 'Uncompressed size',
    compressed: 'Compressed size',
    enable_bundle_controller: 'Bundle controller',
    changelog_account: 'Changelog and Snapshot account',
    node_tag_filter: 'Node tag filter',
    actions: ' ',
    tablet_count: 'Usage',
    tablet_count_limit: 'Limit',
    tablet_count_free: 'Free',
    tablet_count_percentage: 'Percentage',
    tablet_static_memory: 'Usage',
    tablet_static_memory_limit: 'Limit',
    tablet_static_memory_free: 'Free',
    tablet_static_memory_percentage: 'Percentage',
};

const SHORT_TITLE: typeof COLUMN_TITLE = {
    enable_bundle_controller: 'BC',
};

function CopyHostListAction(props: {
    bundle: string;
    copyHostListToClipboard(bundle: string): void;
}) {
    const {bundle, copyHostListToClipboard} = props;

    const handleClick = React.useCallback(
        () => copyHostListToClipboard(bundle),
        [bundle, copyHostListToClipboard],
    );

    return (
        <div className={block('actions-copy-hosts')} onClick={handleClick}>
            <Tooltip
                content={<span className={block('no-wrap')}>Copy hosts to clipboard</span>}
                placement={'bottom-start'}
            >
                <ClipboardButton view="flat-secondary" onCopy={handleClick} />
            </Tooltip>
        </div>
    );
}

class BundlesTable extends React.Component<ReduxProps> {
    renderColumnHeader = (col: string, sortable: boolean) => {
        const {column, order} = this.props.sortState || {};
        const isSorted = col === column;

        return (
            <ColumnHeader
                className={block('header-cell', {col, sortable}, 'data-table__head-cell')}
                column={col}
                title={COLUMN_TITLE[col]}
                shortTitle={SHORT_TITLE[col]}
                order={isSorted ? order : undefined}
                onSort={sortable ? this.onColumnSort : undefined}
                withUndefined
                sortIconSize={14}
            />
        );
    };

    onColumnSort = (column: string, order: OrderType) => {
        this.props.setBundlesSortState({
            column: column as keyof TabletBundle,
            order,
        });
    };

    renderBundle = (data: {row: TabletBundle}) => {
        const {activeBundleLink, cluster, clusterUiConfig} = this.props;
        const {bundle, node_tag_filter, enable_bundle_controller} = data?.row || {};
        const has_tag = Boolean(node_tag_filter);
        return (
            <div className={block('bundle')}>
                <div className={block('name', {has_tag})}>
                    {!bundle ? (
                        'Total'
                    ) : (
                        <Link
                            routed
                            theme={'primary'}
                            url={activeBundleLink(cluster, bundle, enable_bundle_controller)}
                            onClick={() => {
                                this.props.setActiveBundle(bundle);
                            }}
                        >
                            {data?.row?.bundle}
                        </Link>
                    )}
                    {has_tag && <span className={block('name-tag')}>{node_tag_filter}</span>}
                </div>
                {UIFactory.renderBundlesTableItemExtraControls({
                    bundle: data.row,
                    clusterUiConfig,
                    itemClassName: block('extra-control'),
                })}
            </div>
        );
    };

    renderNumber(colName: keyof TabletBundle, data: {row: TabletBundle}) {
        const {[colName]: value} = data?.row || {};
        return hammer.format['Number'](value);
    }

    renderBytes(colName: keyof TabletBundle, data: {row: TabletBundle}) {
        const {[colName]: value} = data?.row || {};
        return hammer.format['Bytes'](value);
    }

    renderBC(data: {row: TabletBundle}) {
        const {bundle, enable_bundle_controller: value} = data?.row || {};
        const isTotalAggregatedRow = !bundle;
        if (isTotalAggregatedRow) return null;

        return <BundleBalancerValue value={value} />;
    }

    renderAccount = (data: {row: TabletBundle}) => {
        const {cluster} = this.props;
        const {changelog_account, snapshot_account} = data?.row || {};
        return (
            <React.Fragment>
                <AccountLink cluster={cluster} account={changelog_account} />
                {changelog_account !== snapshot_account && (
                    <React.Fragment>
                        {', '}
                        <AccountLink cluster={cluster} account={snapshot_account} />
                    </React.Fragment>
                )}
            </React.Fragment>
        );
    };

    renderHealth(data: {row: TabletBundle}) {
        const {health} = data?.row || {};
        return <Health value={health} />;
    }

    renderNodes = (data: {row: TabletBundle}) => {
        const {nodes, node_tag_filter, unique_node_tag, bundle} = data?.row || {};
        if (!unique_node_tag && bundle) {
            const help_tooltip = `This bundle shares nodes with other bundles having node tag filter
             "${node_tag_filter}". Actual amount of available resources depends on the number of tablet cells and may
             be less than displayed in this column.`;
            return (
                <div className={block('nodes')}>
                    <HelpMark
                        popoverProps={{
                            closeDelay: 50,
                            placement: 'auto',
                            content: help_tooltip,
                            className: block('help-tooltip'),
                        }}
                    />
                    {nodes?.length}
                </div>
            );
        }
        return nodes?.length;
    };

    renderActions = (data: {row: TabletBundle}) => {
        const {
            allowPerBundleAccounting,
            bundleDashboardUrl,
            cluster,
            copyHostListToClipboard,
            pathPrefix,
            showCellBundleEditor,
            writeableByName,
        } = this.props;
        const {bundle, nodes, enable_bundle_controller} = data?.row || {};
        if (!bundle) {
            return;
        }
        const path = `${pathPrefix}${bundle}`;

        const allowEdit = enable_bundle_controller ?? writeableByName?.get(bundle);
        return (
            <div className={block('actions')}>
                <div className={block('actions-attrs')}>
                    <ClickableAttributesButton
                        size="m"
                        view="flat-secondary"
                        title={path}
                        path={path}
                    />
                </div>
                {allowPerBundleAccounting && allowEdit && (
                    <div className={block('actions-attrs')}>
                        <Button
                            size="m"
                            view="flat-secondary"
                            onClick={() => showCellBundleEditor(bundle)}
                        >
                            <Icon awesome={'pencil'} />
                        </Button>
                    </div>
                )}
                {bundleDashboardUrl && (
                    <div className={block('actions-attrs')}>
                        <ChartLink
                            url={bundleDashboardUrl(cluster, bundle)}
                            wrapContent={(node) => (
                                <Button size="m" view="flat-secondary">
                                    {node}
                                </Button>
                            )}
                        />
                    </div>
                )}
                {nodes && nodes.length > 0 && (
                    <CopyHostListAction
                        bundle={bundle}
                        copyHostListToClipboard={copyHostListToClipboard}
                    />
                )}
            </div>
        );
    };

    renderTabletCountPercentage(data: {row: TabletBundle}) {
        if (data.row.tablet_count_percentage === undefined) {
            return hammer.format.NO_VALUE;
        }

        const {tablet_count, tablet_count_limit} = data.row;
        const {value, theme, text} = calcProgressProps(tablet_count, tablet_count_limit, 'Number');

        return value === undefined ? (
            hammer.format.NO_VALUE
        ) : (
            <Progress value={value} theme={theme} text={text} />
        );
    }

    renderTabletStaticMemoryPercentage(data: {row: TabletBundle}) {
        if (data.row.tablet_static_memory_percentage === undefined) {
            return hammer.format.NO_VALUE;
        }

        const {tablet_static_memory, tablet_static_memory_limit} = data.row;
        const {value, theme, text} = calcProgressProps(
            tablet_static_memory,
            tablet_static_memory_limit,
            'Bytes',
        );

        return value === undefined ? (
            hammer.format.NO_VALUE
        ) : (
            <Progress value={value} theme={theme} text={text} />
        );
    }

    column(name: string, sortable = false): Column<TabletBundle> {
        return {
            name,
            align: 'left',
            sortable: false,
            className: block('td', {col: name.toLowerCase()}),
            header: this.renderColumnHeader(name, sortable),
        };
    }

    sortableColumn(columnName: keyof TabletBundle) {
        return this.column(columnName, true);
    }

    render() {
        const columns = this.props.columns.map((x) => Columns[x].call(this));

        const {data, total, loading, loaded} = this.props;

        return (
            <div className={block()}>
                <WaitForFont>
                    <DataTableYT
                        loading={loading}
                        loaded={loaded}
                        columns={columns}
                        data={data}
                        settings={TABLE_SETTINGS}
                        theme={'bundles-table'}
                        footerData={data.length ? [total] : undefined}
                    />
                </WaitForFont>
            </div>
        );
    }
}

const Columns = {
    bundle(this: BundlesTable): Column<TabletBundle> {
        return {
            ...this.sortableColumn('bundle'),
            render: this.renderBundle,
        };
    },
    tablet_count_percentage(this: BundlesTable): Column<TabletBundle> {
        return {
            ...this.sortableColumn('tablet_count_percentage'),
            render: this.renderTabletCountPercentage,
            width: 260,
            align: 'center',
        };
    },
    tablet_count(this: BundlesTable): Column<TabletBundle> {
        return {
            ...this.sortableColumn('tablet_count'),
            render: this.renderNumber.bind(this, 'tablet_count'),
            align: 'right',
            width: 150,
        };
    },
    tablet_count_limit(this: BundlesTable): Column<TabletBundle> {
        return {
            ...this.sortableColumn('tablet_count_limit'),
            render: this.renderNumber.bind(this, 'tablet_count_limit'),
            align: 'right',
            width: 150,
        };
    },
    tablet_count_free(this: BundlesTable): Column<TabletBundle> {
        return {
            ...this.sortableColumn('tablet_count_free'),
            render: this.renderNumber.bind(this, 'tablet_count_free'),
            align: 'right',
            width: 150,
        };
    },
    tablet_static_memory_percentage(this: BundlesTable): Column<TabletBundle> {
        return {
            ...this.sortableColumn('tablet_static_memory_percentage'),
            render: this.renderTabletStaticMemoryPercentage,
            width: 260,
            align: 'center',
        };
    },
    tablet_static_memory(this: BundlesTable): Column<TabletBundle> {
        return {
            ...this.sortableColumn('tablet_static_memory'),
            render: this.renderBytes.bind(this, 'tablet_static_memory'),
            align: 'right',
            width: 150,
        };
    },
    tablet_static_memory_limit(this: BundlesTable): Column<TabletBundle> {
        return {
            ...this.sortableColumn('tablet_static_memory_limit'),
            render: this.renderBytes.bind(this, 'tablet_static_memory_limit'),
            align: 'right',
            width: 150,
        };
    },
    tablet_static_memory_free(this: BundlesTable): Column<TabletBundle> {
        return {
            ...this.sortableColumn('tablet_static_memory_free'),
            render: this.renderBytes.bind(this, 'tablet_static_memory_free'),
            align: 'right',
            width: 150,
        };
    },
    health(this: BundlesTable): Column<TabletBundle> {
        return {
            ...this.sortableColumn('health'),
            render: this.renderHealth,
            align: 'center',
            width: 110,
        };
    },
    nodes(this: BundlesTable): Column<TabletBundle> {
        return {
            ...this.sortableColumn('nodes'),
            render: this.renderNodes,
            align: 'right',
            width: 85,
        };
    },
    tabletCells(this: BundlesTable): Column<TabletBundle> {
        return {
            ...this.sortableColumn('tabletCells'),
            render: this.renderNumber.bind(this, 'tabletCells'),
            align: 'right',
            width: 85,
        };
    },
    tablets(this: BundlesTable): Column<TabletBundle> {
        return {
            ...this.sortableColumn('tablets'),
            render: this.renderNumber.bind(this, 'tablets'),
            align: 'right',
            width: 100,
        };
    },
    memory(this: BundlesTable): Column<TabletBundle> {
        return {
            ...this.sortableColumn('memory'),
            render: this.renderBytes.bind(this, 'memory'),
            align: 'right',
            width: 100,
        };
    },
    uncompressed(this: BundlesTable): Column<TabletBundle> {
        return {
            ...this.sortableColumn('uncompressed'),
            align: 'right',
            render: this.renderBytes.bind(this, 'uncompressed'),
            width: 150,
        };
    },
    compressed(this: BundlesTable): Column<TabletBundle> {
        return {
            ...this.sortableColumn('compressed'),
            align: 'right',
            render: this.renderBytes.bind(this, 'compressed'),
            width: 120,
        };
    },
    enable_bundle_controller(this: BundlesTable): Column<TabletBundle> {
        return {
            ...this.sortableColumn('enable_bundle_controller'),
            align: 'center',
            render: this.renderBC,
            width: 80,
        };
    },
    changelog_account(this: BundlesTable): Column<TabletBundle> {
        return {
            ...this.sortableColumn('changelog_account'),
            render: this.renderAccount,
            width: 235,
        };
    },
    actions(this: BundlesTable): Column<TabletBundle> {
        return {
            ...this.column('actions'),
            render: this.renderActions,
            width: 100,
        };
    },
};

export type ReduxProps = {
    loading: boolean;
    loaded: boolean;
    data: TabletBundle[];
    total: TabletBundle;
    sortState?: SortState<keyof TabletBundle>;
    cluster: string;
    clusterUiConfig?: ClusterUiConfig;
    allowPerBundleAccounting: boolean | undefined;
    pathPrefix: string;
    columns: Array<keyof typeof Columns>;
    activeBundleLink(cluster: string, bundle: string, enable_bundle_controller?: boolean): string;
    bundleDashboardUrl?(cluster: string, bundle: string): string | undefined;
    writeableByName?: {get: (bundleName: string) => boolean | undefined};
} & {
    copyHostListToClipboard(bundle: string): void;
    setBundlesSortState(bundlesSort: SortState<keyof TabletBundle>): void;
    setActiveBundle(activeBundle: string): void;
    showCellBundleEditor(bundleName: string): void;
};

export default BundlesTable;
