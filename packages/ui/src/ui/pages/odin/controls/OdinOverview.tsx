import React from 'react';
import cn from 'bem-cn-lite';
import * as d3 from 'd3';
import moment from 'moment';
import _map from 'lodash/map';

import hammer from '@ytsaurus/ui/build/esm/ui/common/hammer';

import {useDispatch, useSelector} from 'react-redux';
import {
    fetchOdinOverview,
    odinOverviewRemovePreset,
    odinOverviewSelectPreset,
    odinOverviewSetAllMetricsVisible,
    odinOverviewSetPresetToRemove,
    odinOverviewShowCreatePresetDialog,
    odinOverviewToggleDefaultPreset,
    reloadOdinOverviewMetricData,
    setOdinLastVisitedTab,
    toggleOdinOverviewMetricVisibility,
} from '../_actions/odin-overview';
import {
    OdinOverviewPreset,
    getOdinOverviewClusterMetrics,
    getOdinOverviewData,
    getOdinOverviewDateFrom,
    getOdinOverviewDateTo,
    getOdinOverviewHiddenMetrics,
    getOdinOverviewPresetToRemove,
    getOdinOverviewVisiblePresets,
} from '../_selectors/odin-overview';
import {MetricData, MetricListItem} from '../odin-utils';
import {OdinOverviewStateDataItem} from '../_reducers/odin-overview';
import Link from '@ytsaurus/ui/build/esm/ui/components/Link/Link';
// @ts-ignore
import InfraDialog from '@ytsaurus/ui/build/esm/ui/components/Dialog/Dialog';

import ErrorBoundary from '@ytsaurus/ui/build/esm/ui/components/ErrorBoundary/ErrorBoundary';
import {Dialog, Popup} from '@gravity-ui/uikit';
import {setMetric} from '../_actions';
import Icon from '@ytsaurus/ui/build/esm/ui/components/Icon/Icon';
import OdinOverviewCreatePresetDialog from './OdinOverviewCreatePresetDialog';

import {ODIN_CELL_SIZE, OdinTab} from '../odin-constants';

import './OdinOverview.scss';
import {absolute} from '@ytsaurus/ui/build/esm/ui/common/utils/url-ts';

const block = cn('odin-overview');

function useOdinOverviewDataLoader(cluster: string) {
    const dispatch = useDispatch();
    React.useEffect(() => {
        const f = () => {
            dispatch(fetchOdinOverview(cluster));
        };
        f();
        const id = window.setInterval(f, 60 * 1000);
        return () => {
            clearInterval(id);
        };
    }, [cluster]);
}

const DATE_FORMAT = 'D MMM ';
const TIME_FORMAT = 'HH:mm';
const D_O_Y_FORMAT = 'DDD YYYY';

function formatByDates(from: Date, to: Date) {
    const isToday = moment(to).format(D_O_Y_FORMAT) === moment().format(D_O_Y_FORMAT);
    return isToday && moment(from).format(DATE_FORMAT) === moment(to).format(DATE_FORMAT)
        ? TIME_FORMAT
        : DATE_FORMAT + TIME_FORMAT;
}

interface OdinOverviewProps {
    cluster: string;
}

export default function OdinOverviewWithPreset({cluster}: OdinOverviewProps) {
    const dispatch = useDispatch();
    React.useEffect(() => {
        dispatch(setOdinLastVisitedTab(OdinTab.OVERVIEW));
    }, []);
    return (
        <React.Fragment>
            <OdinOverviewPresets />
            <OdinOverview cluster={cluster} />
            <OdinOverviewCreatePresetDialog />
        </React.Fragment>
    );
}

function OdinOverviewPresets() {
    const presets = useSelector(getOdinOverviewVisiblePresets);
    return (
        <div className={block('presets')}>
            {_map(presets, (item) => (
                <OdinOverviewPresetItem key={item.name} {...item} />
            ))}
        </div>
    );
}

function OdinOverviewPresetItem({name, isDefault}: OdinOverviewPreset) {
    const dispatch = useDispatch();
    return (
        <div className={block('preset')} onClick={() => dispatch(odinOverviewSelectPreset(name))}>
            <Link
                className={block('preset-star')}
                theme={'ghost'}
                onClick={() => {
                    dispatch(odinOverviewToggleDefaultPreset(name));
                }}
                title={isDefault ? 'Unmark as default' : 'Mark as default'}
            >
                <Icon awesome={'star'} face={isDefault ? 'solid' : 'regular'} />
            </Link>
            <span className={block('preset-name')} title={name}>
                {name}
            </span>
            <Link
                className={block('preset-remove')}
                theme={'ghost'}
                onClick={(e) => {
                    e.stopPropagation();
                    dispatch(odinOverviewSetPresetToRemove(name));
                }}
                title={'Remove'}
            >
                <Icon awesome={'times'} />
            </Link>
        </div>
    );
}

function OdinOverviewRemoveConfirmationDialog() {
    const presetToRemove = useSelector(getOdinOverviewPresetToRemove);
    const dispatch = useDispatch();

    const handleClose = React.useCallback(() => {
        dispatch(odinOverviewSetPresetToRemove(undefined));
    }, []);

    const handleAdd = React.useCallback(async () => {
        if (presetToRemove) {
            await dispatch(odinOverviewRemovePreset(presetToRemove));
            return;
        }
        return Promise.resolve();
    }, [presetToRemove, dispatch]);

    return (
        <InfraDialog
            pristineSubmittable
            visible={Boolean(presetToRemove)}
            onClose={handleClose}
            onAdd={handleAdd}
            fields={[
                {
                    type: 'block',
                    name: 'text',
                    extras: {
                        children: (
                            <div>
                                Are you sure you want to remove
                                <span className={block('preset-to-remove')}>
                                    {' '}
                                    {presetToRemove}{' '}
                                </span>
                                preset
                            </div>
                        ),
                    },
                },
            ]}
            headerProps={{
                title: `Remove "${presetToRemove}"`,
            }}
            footerProps={{
                textApply: 'Remove',
            }}
        />
    );
}

function OdinOverview(props: OdinOverviewProps) {
    const {cluster} = props;
    useOdinOverviewDataLoader(cluster);

    const from = useSelector(getOdinOverviewDateFrom);
    const to = useSelector(getOdinOverviewDateTo);
    const clusterMetrics = useSelector(getOdinOverviewClusterMetrics);
    const data = useSelector(getOdinOverviewData);
    const hiddenMap = useSelector(getOdinOverviewHiddenMetrics);

    const [tooltipData, setTooltip] = React.useState<Partial<TooltipState>>({});
    const [dialogData, setDialogData] = React.useState<DialogData | null>(null);

    const onTooltip = React.useCallback(
        (name: string, d?: MetricData, el?: Element, index?: number) => {
            if (el) {
                const {width, height} = el.getBoundingClientRect();
                (el as any).offsetWidth = width;
                (el as any).offsetHeight = height;
                setTooltip({
                    metricName: name,
                    metricData: d,
                    metricDataIndex: index,
                    anchor: el,
                });
            } else {
                setTooltip({});
            }
        },
        [setTooltip],
    );

    const onClick = React.useCallback(
        (metricName: string, metricData: MetricData, metricDataIndex: number) => {
            setDialogData({metricName, metricData, metricDataIndex});
        },
        [setDialogData],
    );

    const onClose = React.useCallback(() => {
        setDialogData(null);
    }, [setDialogData]);

    const dispatch = useDispatch();

    if (!from || !to) {
        return null;
    }

    const format = formatByDates(from, to);
    return (
        <ErrorBoundary>
            <div className={block()}>
                <div className={block('grid')}>
                    <div className={block('dates')}>
                        <div className={block('dates-item')}>
                            <span>{moment(from).format(format)}</span>
                        </div>
                        <div className={block('dates-item')}>
                            <span className={block('dates-item-to')}>
                                {moment(to).add(-1, 'minute').format(format)}
                            </span>
                        </div>
                    </div>
                    <div className={block('show-hide-all')}>
                        <Link
                            theme={'ghost'}
                            onClick={() => dispatch(odinOverviewSetAllMetricsVisible(true))}
                        >
                            Show all
                        </Link>
                        <span> / </span>
                        <Link
                            theme={'ghost'}
                            onClick={() => dispatch(odinOverviewSetAllMetricsVisible(false))}
                        >
                            Hide all
                        </Link>
                    </div>
                    <div className={block('save')}>
                        <Link
                            theme={'ghost'}
                            onClick={() => dispatch(odinOverviewShowCreatePresetDialog(true))}
                        >
                            <Icon awesome={'save'} />
                        </Link>
                    </div>
                    {clusterMetrics.map((item) => {
                        return (
                            <OverviewRow
                                key={item.name}
                                item={item}
                                data={data[item.name]}
                                onTooltip={onTooltip}
                                onClick={onClick}
                                hidden={hiddenMap[item.name]}
                            />
                        );
                    })}
                </div>
            </div>
            <OdinOverviewTooltip {...tooltipData} from={from} />
            {dialogData && (
                <OdinOverviewDetailsDialog {...dialogData} from={from} onClose={onClose} />
            )}
            <OdinOverviewRemoveConfirmationDialog />
        </ErrorBoundary>
    );
}

function dateByIndex(from: Date, index: number) {
    return moment(from)
        .add(index, 'minute')
        .format(DATE_FORMAT + TIME_FORMAT);
}

interface TooltipState {
    metricName?: string;
    metricData?: MetricData;
    metricDataIndex?: number;
    anchor?: Element;
}

interface DialogData {
    metricName: string;
    metricData: MetricData;
    metricDataIndex: number;
}

function OdinOverviewTooltip(props: TooltipState & {from: Date}) {
    const {anchor, from, metricDataIndex, metricName, metricData} = props;
    if (!anchor || undefined === metricDataIndex) {
        return null;
    }
    return (
        <Popup
            anchorRef={{current: anchor as HTMLElement}}
            placement={['top', 'top-end', 'top-start', 'bottom', 'bottom-end', 'bottom-start']}
            open={true}
        >
            <div>
                <div>
                    {dateByIndex(from, metricDataIndex)}
                    <span
                        className={block('status', {
                            state: metricData?.state,
                        })}
                    >
                        {hammer.format.Readable(metricData?.state)}
                    </span>
                </div>
                {metricName}
            </div>
        </Popup>
    );
}

function OdinOverviewDetailsDialog(props: DialogData & {from: Date; onClose: () => void}) {
    const {metricName, metricData, metricDataIndex, from, onClose} = props;

    const status = (
        <span className={block('status', {state: metricData.state})}>
            {hammer.format.Readable(metricData.state)}
        </span>
    );

    return (
        <Dialog onClose={onClose} open={true} className={block('dialog')}>
            <Dialog.Header
                caption={
                    <div className={block('dialog-header')}>
                        <span className={block('dialog-time')}>
                            {dateByIndex(from, metricDataIndex)}
                        </span>
                        {metricName}
                        {status}
                    </div>
                }
            />
            <Dialog.Divider />
            <Dialog.Body>
                <pre className={block('dialog-message')}>{metricData.message || status}</pre>
            </Dialog.Body>
        </Dialog>
    );
}

interface OverviewRowProps {
    item: MetricListItem;
    data: OdinOverviewStateDataItem;
    onTooltip: (name: string, d?: MetricData, el?: Element, index?: number) => void;
    onClick: (name: string, d: MetricData, index: number) => void;
    hidden: boolean;
}

function OverviewRowImpl(props: OverviewRowProps) {
    const {item, data, onTooltip, onClick, hidden} = props;
    const handleTooltip = React.useCallback(
        (d?: MetricData, el?: Element, index?: number) => {
            onTooltip(item.display_name, d, el, index);
        },
        [item.display_name, onTooltip],
    );

    const handleClick = React.useCallback(
        (d: MetricData, index: number) => {
            onClick(item.display_name, d, index);
        },
        [onClick, item.display_name],
    );

    const dispatch = useDispatch();
    const handleNameClick = React.useCallback(() => {
        dispatch(setMetric(item.name));
    }, [item.name]);

    const handleHide = React.useCallback(() => {
        dispatch(toggleOdinOverviewMetricVisibility(item.name));
    }, [item.name]);

    return (
        <React.Fragment>
            <div className={block('graph-cell')}>
                {hidden ? (
                    <div className={block('hidden-graph')}>hidden</div>
                ) : (
                    <OverviewRowData
                        {...data}
                        name={item.name}
                        handle={{
                            tooltip: handleTooltip,
                            click: handleClick,
                        }}
                    />
                )}
            </div>
            <div className={block('name')}>
                <Link
                    url={`${absolute('./details')}?metric=${item.name}`}
                    onClick={handleNameClick}
                    routedPreserveLocation
                    routed
                >
                    {item.display_name}
                </Link>
            </div>
            <div>
                <Link
                    theme={'ghost'}
                    onClick={handleHide}
                    title={'Click to ' + (hidden ? 'display' : 'hide')}
                >
                    <Icon awesome={hidden ? 'eye-slash' : 'eye'} />
                </Link>
            </div>
        </React.Fragment>
    );
}

const OverviewRow = React.memo(OverviewRowImpl);

interface OverviewRowDataProps extends OdinOverviewStateDataItem {
    name: string;
    handle: EventHandlers;
}

function OverviewRowData(props: OverviewRowDataProps) {
    const {error, metricData, name, handle} = props;

    return (
        <div className={block('row-data')}>
            {error ? (
                <OverviewRowError name={name} error={error} />
            ) : (
                <OverviewRowDataGraph items={metricData} handle={handle} />
            )}
        </div>
    );
}

function OverviewRowError({error, name}: {error: any; name: string}) {
    const dispatch = useDispatch();
    const handleClick = React.useCallback(() => {
        dispatch(reloadOdinOverviewMetricData(name));
    }, [name]);
    return (
        <div className={'error'}>
            <Link onClick={handleClick}>Reload. </Link>
            {String(error)}
        </div>
    );
}

function OverviewRowDataGraph({items, handle}: {items?: Array<MetricData>; handle: EventHandlers}) {
    const ref = React.createRef<HTMLDivElement>();
    useDataRenderer(ref, items, handle);
    return <div className={block('graph')} ref={ref} />;
}

function useDataRenderer(
    ref: React.RefObject<HTMLDivElement>,
    items: Array<MetricData> | undefined,
    handle: EventHandlers,
) {
    React.useEffect(() => {
        if (ref.current && items) {
            renderData(ref.current, items, handle);
        }
    }, [ref, items]);
}

interface EventHandlers {
    click: (d: MetricData, index: number) => void;
    tooltip: (d?: MetricData, el?: Element, index?: number) => void;
}

function renderData(div: HTMLDivElement, items: Array<MetricData>, handle: EventHandlers) {
    const selDiv = d3.select(div);
    selDiv.selectAll('svg').data([null]).enter().append('svg').attr('class', block('svg'));

    const svg = selDiv.select<SVGElement>('svg');
    const {width, height} = svg.node()!.getBoundingClientRect();
    const itemW = ODIN_CELL_SIZE;
    const offsetX = width - itemW * items.length;

    const rects = svg.selectAll<SVGRectElement, MetricData>('rect').data(items);
    rects.exit().remove();
    const added = rects.enter().append('rect');
    const selection = rects
        .merge(added)
        .attr('width', itemW - 1)
        .attr('height', height - 1)
        .attr('x', (__, index: number) => {
            return offsetX + itemW * index;
        })
        .attr('class', (d: MetricData) => {
            return block('rect', {state: d.state});
        });

    selection
        .on('click', function (_event: unknown, d: MetricData) {
            const index = selection.nodes().indexOf(this);
            handle.click(d, index);
        })
        .on('mouseenter', function (_event: unknown, d: MetricData) {
            const index = selection.nodes().indexOf(this);
            handle.tooltip(d, this, index);
        })
        .on('mouseout', () => {
            handle.tooltip();
        });
}
