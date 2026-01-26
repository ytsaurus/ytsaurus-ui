import React from 'react';
import cn from 'bem-cn-lite';

import capitalize_ from 'lodash/capitalize';

import DataTable, {Column, Settings} from '@gravity-ui/react-data-table';

import ClickableAttributesButton from '../../../components/AttributesButton/ClickableAttributesButton';
import ClipboardButton from '../../../components/ClipboardButton/ClipboardButton';
import ColumnHeader from '../../../components/ColumnHeader/ColumnHeader';
import DataTableYT from '../../../components/DataTableYT/DataTableYT';
import Icon from '../../../components/Icon/Icon';
import Label, {LabelTheme} from '../../../components/Label/Label';
import Link from '../../../components/Link/Link';
import {Tooltip} from '../../../components/Tooltip/Tooltip';
import {STICKY_TOOLBAR_BOTTOM} from '../../../components/WithStickyToolbar/WithStickyToolbar';
import {Health} from '../../../components/Health/Health';
import {OrderType} from '../../../utils/sort-helpers';
import {Host} from '../../../containers/Host/Host';
// @ts-ignore
import hammer from '@ytsaurus/interface-helpers/lib/hammer';
import type {TabletCell, TabletsPartialAction} from '../../../store/reducers/tablet_cell_bundles';
import type {SortState} from '../../../types';

import './CellsTable.scss';

const block = cn('cells-table');

export interface Props {}

const STATE_THEME: {[type: string]: LabelTheme} = {
    leading: 'success',
    //following: 'primary',
    none: 'default',
    elections: 'warning',
    leader_recovery: 'warning',
};

const TABLE_SETTINGS: Settings = {
    displayIndices: false,
    stickyHead: DataTable.MOVING,
    stickyTop: STICKY_TOOLBAR_BOTTOM,
    syncHeadOnResize: true,
    dynamicRender: true,
};
//
// function valueOrNone(value: any) {
//     return value === undefined ? hammer.format.NO_VALUE : value;
// }

const COLUMN_TITLE: {[name: string]: string} = {
    id: 'Cell id',
    uncompressed: 'Uncompressed size',
    compressed: 'Compressed size',
    peerAddress: 'Node',
    actions: ' ',
};

interface HoverActionProps {
    children: React.ReactNode;
}

function HoverAction(props: HoverActionProps) {
    return <span className={block('hover-action')}>{props.children}</span>;
}

function wrapCell<T extends (...args: any) => any>(renderCell: T) {
    return function WrappedCell(...args: Parameters<T>) {
        return <div className={block('wrapped')}>{renderCell(...(args as any))}</div>;
    };
}

class CellsTable extends React.Component<Props & ReduxProps> {
    renderColumnHeader = (col: string, sortable: boolean) => {
        const {
            sortState: {column, order},
        } = this.props;
        const isSorted = col === column;

        return (
            <ColumnHeader
                className={block('header-cell', {col, sortable}, 'data-table__head-cell')}
                column={col}
                title={COLUMN_TITLE[col] ?? capitalize_(col)}
                order={isSorted ? order : undefined}
                onSort={this.onColumnSort}
                withUndefined
                sortIconSize={14}
            />
        );
    };

    onColumnSort = (column: string, order: OrderType) => {
        this.props.setTabletsPartial({
            cellsSort: {column: column as keyof TabletCell, order},
        });
    };

    renderNumber(colName: keyof TabletCell, data: {row: TabletCell}) {
        const {[colName]: value} = data?.row || {};
        return hammer.format['Number'](value);
    }

    renderBytes(colName: keyof TabletCell, data: {row: TabletCell}) {
        const {[colName]: value} = data?.row || {};
        return hammer.format['Bytes'](value);
    }

    renderHealth(data: {row: TabletCell}) {
        const {health} = data?.row || {};
        return <Health value={health} />;
    }

    renderId = (data: {row: TabletCell}) => {
        const {id} = data?.row || {};
        return (
            <div className={block('id')}>
                <span className={block('id-id')}>{id}</span>
                <HoverAction>
                    <ClipboardButton view="flat-secondary" text={id} />
                </HoverAction>
            </div>
        );
    };

    renderHost(data: {row: TabletCell}) {
        return (
            <Host
                asTabletNode
                address={data?.row?.peerAddress}
                copyBtnClassName={block('hover-action')}
            />
        );
    }

    renderBundle = (data: {row: TabletCell}) => {
        const {activeBundleLink, cluster} = this.props;
        const {bundle} = data?.row || {};
        return (
            <Link
                routed
                theme={'primary'}
                url={activeBundleLink(cluster, bundle)}
                onClick={() => {
                    this.props.setTabletsActiveBundle(bundle);
                }}
            >
                {bundle}
            </Link>
        );
    };

    renderState = (data: {row: TabletCell}) => {
        const {state} = data?.row ?? {};
        const theme = state ? STATE_THEME[state] : undefined;
        return <Label theme={theme} type="text" text={state} capitalize />;
    };

    renderActions = (data: {row: TabletCell}) => {
        const {attributesPath, cellNavigationLink, cluster} = this.props;
        const {id} = data?.row || {};
        return (
            <div className={block('actions')}>
                <Tooltip placement={['bottom', 'top']} content={'Go to Navigation'}>
                    <Link
                        className={block('cell-navigation-link')}
                        url={cellNavigationLink(cluster, id)}
                        theme="ghost"
                        routed
                    >
                        <Icon awesome="folder" size={13} />
                    </Link>
                </Tooltip>
                <ClickableAttributesButton
                    size="m"
                    view="flat-secondary"
                    title={id}
                    path={attributesPath(id)}
                />
            </div>
        );
    };

    column(name: string, sortable = false): Column<TabletCell> {
        return {
            name,
            align: 'left',
            sortable: false,
            className: block('td', {col: name.toLocaleLowerCase()}),
            header: this.renderColumnHeader(name, sortable),
        };
    }

    sortableColumn(name: keyof TabletCell) {
        return this.column(name, true);
    }

    render() {
        const columns = this.props.columns.map((x) => Columns[x].call(this));

        const {data, loading, loaded} = this.props;

        return (
            <div className={block()}>
                <DataTableYT
                    loading={loading}
                    loaded={loaded}
                    columns={columns}
                    data={data}
                    settings={TABLE_SETTINGS}
                    theme={'bundles-table'}
                />
            </div>
        );
    }
}

const Columns = {
    id(this: CellsTable): Column<TabletCell> {
        return {
            ...this.sortableColumn('id'),
            render: this.renderId,
            width: 400,
        };
    },
    bundle(this: CellsTable): Column<TabletCell> {
        return {
            ...this.sortableColumn('bundle'),
            render: wrapCell(this.renderBundle),
        };
    },
    health(this: CellsTable): Column<TabletCell> {
        return {
            ...this.sortableColumn('health'),
            render: wrapCell(this.renderHealth),
            width: 80,
        };
    },
    tablets(this: CellsTable): Column<TabletCell> {
        return {
            ...this.sortableColumn('tablets'),
            render: wrapCell(this.renderNumber.bind(this, 'tablets')),
            align: 'right',
            width: 100,
        };
    },
    memory(this: CellsTable): Column<TabletCell> {
        return {
            ...this.sortableColumn('memory'),
            render: wrapCell(this.renderBytes.bind(this, 'memory')),
            align: 'right',
            width: 100,
        };
    },
    uncompressed(this: CellsTable): Column<TabletCell> {
        return {
            ...this.sortableColumn('uncompressed'),
            render: wrapCell(this.renderBytes.bind(this, 'uncompressed')),
            align: 'right',
            width: 150,
        };
    },
    compressed(this: CellsTable): Column<TabletCell> {
        return {
            ...this.sortableColumn('compressed'),
            render: wrapCell(this.renderBytes.bind(this, 'compressed')),
            align: 'right',
            width: 130,
        };
    },
    peerAddress(this: CellsTable): Column<TabletCell> {
        return {
            ...this.sortableColumn('peerAddress'),
            render: this.renderHost,
            width: 130,
        };
    },
    state(this: CellsTable): Column<TabletCell> {
        return {
            ...this.sortableColumn('state'),
            render: wrapCell(this.renderState),
            width: 100,
        };
    },
    actions(this: CellsTable): Column<TabletCell> {
        return {
            ...this.column('actions'),
            render: this.renderActions,
            width: 70,
        };
    },
};

export type ReduxProps = {
    cluster: string;
    loading: boolean;
    loaded: boolean;
    data: TabletCell[];
    sortState: SortState<keyof TabletCell>;
    columns: Array<keyof typeof Columns>;
    activeBundleLink(cluster: string, bundle: string): string;
    attributesPath(id: string): string;
    cellNavigationLink(cluster: string, cellId: string): string;
} & {
    setTabletsPartial(data: TabletsPartialAction['data']): void;
    setTabletsActiveBundle(activeBundle: string): void;
};

export default CellsTable;
