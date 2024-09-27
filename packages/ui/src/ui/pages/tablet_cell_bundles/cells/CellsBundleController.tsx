import React from 'react';
import cn from 'bem-cn-lite';

import filter_ from 'lodash/filter';

import format from '../../../common/hammer/format';

import DataTable, {Column, Settings} from '@gravity-ui/react-data-table';
import DataTableYT from '../../../components/DataTableYT/DataTableYT';
import {Toolbar} from '../../../components/WithStickyToolbar/Toolbar/Toolbar';
import Filter from '../../../components/Filter/Filter';
import Label from '../../../components/Label/Label';
import Link from '../../../components/Link/Link';
import WithStickyToolbar, {
    STICKY_TOOLBAR_BOTTOM,
} from '../../../components/WithStickyToolbar/WithStickyToolbar';
import ChartLink from '../../../components/ChartLink/ChartLink';
import Icon from '../../../components/Icon/Icon';
import {Tooltip} from '../../../components/Tooltip/Tooltip';

import {AllocatedInstance, InProgressInstance} from '../../../store/reducers/tablet_cell_bundles';

import './CellsBundleController.scss';
import {lastWord, printUsageLimit} from '../../../utils';
import ClickableAttributesButton from '../../../components/AttributesButton/ClickableAttributesButton';
import {makeNavigationLink} from '../../../utils/app-url';
import ClipboardButton from '../../../components/ClipboardButton/ClipboardButton';
import {Progress} from '@gravity-ui/uikit';
import {computeProgress, getProgressTheme} from '../../../utils/progress';

const block = cn('cells-bundle-controller');

interface RowData {
    address?: string;
    url?: string;
    data?: AllocatedInstance;
    allocationState?: InProgressInstance['hulk_request_state'] | 'removing';
    hulkRequestPath?: string;
    tablet_static_memory?: {used?: number; limit?: number};
    deployUrl?: string;
    nannyUrl?: string;
}

type ColumnRenderProps<T> = {
    value?: unknown;
    row: T;
    index: number;
    footer?: boolean;
    headerData?: boolean;
};

const COLUMNS: Array<Column<RowData>> = [
    {
        name: 'Address',
        render: ({row}) => {
            const {url, address} = row;
            return (
                <span>
                    <Link className={block('address-host')} url={url} routed>
                        {address}
                    </Link>
                    {address && (
                        <ClipboardButton
                            text={address}
                            view={'flat'}
                            inlineMargins
                            visibleOnRowHover
                        />
                    )}
                </span>
            );
        },
        sortable: false,
    },
    {
        name: 'Type',
        render: renderType,
        sortable: false,
        width: 200,
    },
    {
        name: 'tablet_static_memory',
        header: 'Tablet static memory',
        render: ({row}) => {
            const {tablet_static_memory} = row;
            if (!tablet_static_memory) {
                return format.NO_VALUE;
            }

            const {used, limit} = tablet_static_memory;
            const text = printUsageLimit(format.Bytes(used), format.Bytes(limit));
            const progress = computeProgress(used, limit) ?? 0;
            return <Progress value={progress} theme={getProgressTheme(progress)} text={text} />;
        },
        sortable: false,
        width: 200,
        align: 'center',
    },
    {
        name: 'Allocation request',
        render: ({row}) => {
            const {hulkRequestPath} = row;
            if (!hulkRequestPath) {
                return format.NO_VALUE;
            }

            const {suffix: uuid} = lastWord(hulkRequestPath, '/');
            return (
                <span className={block('alloc-request')}>
                    <ClickableAttributesButton
                        className={block('alloc-request-attrs')}
                        title={uuid}
                        exactPath={hulkRequestPath}
                    />
                    <Link
                        className={block('alloc-request-url')}
                        url={makeNavigationLink(hulkRequestPath)}
                    >
                        {uuid}
                    </Link>
                </span>
            );
        },
        width: 300,
        align: 'center',
        sortable: false,
    },
    {
        name: 'Allocation state',
        render: ({row}) => {
            const {allocationState} = row;
            const tooltip =
                allocationState === 'IN_PROGRESS'
                    ? 'Please note that allocating new instances on MapReduce clusters can take several hours.'
                    : undefined;

            return !allocationState ? (
                format.NO_VALUE
            ) : (
                <Tooltip content={tooltip} useFlex>
                    <Label text={format.ReadableField(allocationState.toLocaleLowerCase())} />
                    {Boolean(tooltip) && <Icon awesome="question-circle" color="secondary" />}
                </Tooltip>
            );
        },
        sortable: false,
        align: 'center',
        width: 200,
    },
    {
        name: '',
        render: ({row}) => {
            return (
                <React.Fragment>
                    {renderDeployUrl(row)}
                    {renderNannyUrl(row)}
                </React.Fragment>
            );
        },
        width: 80,
        align: 'center',
    },
];

function useColumns(hideColumns?: Array<string>) {
    const res = React.useMemo(() => {
        if (!hideColumns?.length) {
            return COLUMNS;
        }

        const toHide = new Set(hideColumns);
        return COLUMNS.filter((item) => !toHide.has(item.name));
    }, [hideColumns]);
    return res;
}

function renderDeployUrl(row: RowData) {
    const {deployUrl} = row;
    return !deployUrl ? null : (
        <Tooltip
            className={block('link-icon')}
            content="Deploy"
            placement={['top-end', 'bottom-end']}
        >
            <ChartLink url={deployUrl} hideIcon>
                <Icon awesome="rocket" face="solid" />
            </ChartLink>
        </Tooltip>
    );
}

function renderNannyUrl(row: RowData) {
    const {nannyUrl} = row;
    if (!nannyUrl) {
        return null;
    }
    return (
        <Tooltip
            className={block('link-icon')}
            content="Nanny"
            placement={['top-end', 'bottom-end']}
        >
            <ChartLink url={nannyUrl} hideIcon>
                <Icon awesome={'cloud'} face="solid" />
            </ChartLink>
        </Tooltip>
    );
}

function renderType(props: ColumnRenderProps<RowData>) {
    const {memory, vcpu} = props.row.data?.resource || {};
    const formattedMemory = format.Bytes(memory);
    const formattedVcpu = format.vCores(vcpu);
    return (
        <div>
            {formattedMemory}, {formattedVcpu}
        </div>
    );
}

const TABLE_SETTINGS: Settings = {
    displayIndices: false,
    stickyHead: DataTable.MOVING,
    stickyTop: STICKY_TOOLBAR_BOTTOM,
    syncHeadOnResize: true,
    dynamicRender: true,
};

interface CellsBundleControllerProps {
    hideColumns?: Array<string>;
    items: Array<RowData>;
}

export function CellsBundleController({items, hideColumns}: CellsBundleControllerProps) {
    const [filter, setFilter] = React.useState('');

    const data = React.useMemo(() => {
        return !filter ? items : filter_(items, ({address}) => -1 !== address?.indexOf(filter));
    }, [items, filter]);

    const columns = useColumns(hideColumns);

    const renderToolbar = (
        <Toolbar
            itemsToWrap={[
                {
                    name: 'filter',
                    node: (
                        <Filter
                            hasClear
                            size="m"
                            type="text"
                            value={filter}
                            placeholder="Enter address..."
                            onChange={setFilter}
                            autofocus={false}
                            debounce={400}
                            skipBlurByEnter
                        />
                    ),
                },
            ]}
        />
    );

    return (
        <div className={block()}>
            <WithStickyToolbar
                toolbar={renderToolbar}
                content={
                    <DataTableYT<RowData>
                        useThemeYT
                        columns={columns}
                        data={data}
                        settings={TABLE_SETTINGS}
                        emptyDataMessage="No items to show"
                    />
                }
            />
        </div>
    );
}
