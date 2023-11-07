import * as React from 'react';

import {Button, Icon, Text} from '@gravity-ui/uikit';
import {ColumnType, Table} from '../components/Table';
import {NodeProgress, NodeState} from '../models/plan';
import cn from 'bem-cn-lite';

import {useGraphColors} from '../GraphColors';
import {NodeName} from '../components/NodeName/NodeName';
import {ProcessedNode, drawRunningIcon, operationsStateConfig} from '../utils';

import {AxisProps, OnRulerUpdateProps} from './Timeline';

import expand from '@gravity-ui/icons/svgs/chevron-down.svg';
import collapse from '@gravity-ui/icons/svgs/chevron-up.svg';
import scaleTimelineButtonIcon from '@gravity-ui/icons/svgs/chevrons-expand-up-right.svg';

const block = cn('timeline');

const collapseIcon = <Icon data={collapse} size={14} />;
const expandIcon = <Icon data={expand} size={14} />;
const scaleTimelineIcon = <Icon data={scaleTimelineButtonIcon} size={14} />;

interface ScaleButtonProps {
    onRulerUpdate: (data: OnRulerUpdateProps) => void;
    from?: number;
    to?: number;
    disabled?: boolean;
}

function ScaleButton({onRulerUpdate, from, to, disabled = false}: ScaleButtonProps) {
    const onSetScaleHandler = () => {
        onRulerUpdate({from, to});
    };
    return (
        <Button
            view="flat"
            title={'Set timeline scale'}
            size="s"
            onClick={onSetScaleHandler}
            disabled={disabled}
        >
            {scaleTimelineIcon}
        </Button>
    );
}

interface CollapseButtonProps {
    isCommonButton?: boolean;
    disabled?: boolean;
    onClick: VoidFunction;
    isExpanded?: boolean;
}

function CollapseButton({isCommonButton, disabled, onClick, isExpanded}: CollapseButtonProps) {
    const titleExpand = isCommonButton ? 'Expand all' : 'Expand';
    const titleCollapse = isCommonButton ? 'Collapse all' : 'Collapse';

    const titleDisabled = disabled ? 'No items to expand' : '';

    return (
        <span title={titleDisabled}>
            <Button
                view="flat"
                title={isExpanded ? titleCollapse : titleExpand}
                size="s"
                onClick={onClick}
                disabled={disabled}
            >
                {isExpanded ? collapseIcon : expandIcon}
            </Button>
        </span>
    );
}

export interface RowType extends Partial<AxisProps> {
    isExpanded?: boolean;
    isEvent?: boolean;
    name?: string;
    tracksCount?: number;
    axisId?: string;
    node: ProcessedNode;
}

export interface GetColumnsProps {
    onRulerUpdate: (data: OnRulerUpdateProps) => void;
    onExpandAxis?: (id: string) => void;
    nameHeader: JSX.Element;
    controlsHeader: JSX.Element;
}

export function getColumns({
    nameHeader,
    controlsHeader,
    onRulerUpdate,
    onExpandAxis,
}: GetColumnsProps) {
    const columns: ColumnType<RowType>[] = [
        {
            name: 'status',
            header: 'Status',
            width: 110,
            sortable: false,
            render({row}) {
                const {node, isEvent} = row;
                return isEvent ? null : (
                    <span className={block('row-status')}>
                        <Text color="secondary">
                            {node.type === 'in' || node.type === 'out' ? (
                                '-'
                            ) : (
                                <NodeStatus progress={node.progress} />
                            )}
                        </Text>
                    </span>
                );
            },
        },
        {
            name: 'name',
            header: nameHeader ?? 'Name',
            sortable: false,
            width: 220,
            align: 'right',
            render: function NodeRow({row}) {
                const {isEvent, name, id, isExpanded, node} = row;
                if (isEvent) {
                    return (
                        <div className={block('event-name')} title={name}>
                            {name}
                        </div>
                    );
                }
                return (
                    <div
                        key={id}
                        className={block('aside-item', {
                            expanded: isExpanded,
                        })}
                    >
                        <NodeName node={node} className={block('node-name')} />
                    </div>
                );
            },
        },
        {
            name: 'controls',
            header: controlsHeader ?? '',
            sortable: false,
            width: 60,
            render: function NodeRow({row}) {
                const {node, isExpanded, from, to, id, isExpandable} = row;
                if (node.type === 'in' || node.type === 'out') {
                    return null;
                }
                return (
                    <div>
                        <ScaleButton onRulerUpdate={onRulerUpdate} from={from} to={to} />
                        {isExpandable && id && onExpandAxis ? (
                            <CollapseButton
                                onClick={() => onExpandAxis(id)}
                                isExpanded={isExpanded}
                            />
                        ) : null}
                    </div>
                );
            },
        },
    ];

    return columns;
}

function NodeStatus({progress}: {progress: NodeProgress | undefined}) {
    const state = progress?.state ?? 'NotStarted';
    const {completed = 0, total} = progress ?? {};
    const completePercent = Math.floor((completed / (total || 1)) * 100);
    return (
        <span className={block('node-status')}>
            <NodeStatusIcon state={state} progress={progress} />
            <span>
                {state === 'InProgress'
                    ? `${operationsStateConfig[state].title}: ${completePercent}%`
                    : operationsStateConfig[state].title}
            </span>
        </span>
    );
}

interface NodeStatusIconProps {
    state: NodeState | 'NotStarted';
    progress: NodeProgress | undefined;
}

function NodeStatusIcon({state, progress}: NodeStatusIconProps) {
    const colors = useGraphColors();
    if (state === 'InProgress') {
        return (
            <img className={block('node-status-icon')} src={drawRunningIcon(progress, colors)} />
        );
    }
    return <div className={block('node-status-icon', {state: state.toLowerCase()})} />;
}

interface TimelineTableProps {
    tableItems: RowType[];
    isSomeAxesCollapsed: boolean;
    blocksQuantity: number;
    onExpandAll: VoidFunction;
    onSidebarScroll: VoidFunction;
    onRulerUpdate: (data: OnRulerUpdateProps) => void;
    onExpandAxis?: (id: string) => void;
    sidebarRef: React.MutableRefObject<HTMLDivElement | null>;
}

export function TimelineTable(props: TimelineTableProps) {
    const renderNameHeader = () => {
        const {blocksQuantity} = props;
        return (
            <span>
                {
                    [
                        `Name (${blocksQuantity} block)`,
                        `Name (${blocksQuantity} blocks)`,
                        `Name (${blocksQuantity} blocks)`,
                        'Name (no blocks)',
                    ][blocksQuantity]
                }
            </span>
        );
    };

    const renderControlsHeader = () => {
        const {onRulerUpdate, onExpandAll, isSomeAxesCollapsed, tableItems} = props;

        const hasExpandableItems = tableItems.some(({isExpandable}) => isExpandable);

        return (
            <div>
                <ScaleButton onRulerUpdate={onRulerUpdate} />
                <CollapseButton
                    onClick={onExpandAll}
                    disabled={tableItems.length === 0 || !hasExpandableItems}
                    isExpanded={!isSomeAxesCollapsed}
                    isCommonButton
                />
            </div>
        );
    };

    return (
        <div className={block('aside-header')}>
            <Table
                columns={getColumns({
                    controlsHeader: renderControlsHeader(),
                    nameHeader: renderNameHeader(),
                    onRulerUpdate: props.onRulerUpdate,
                    onExpandAxis: props.onExpandAxis,
                })}
                data={props.tableItems}
                rowClassName={block('table-row')}
                rowHeight={25}
                headerHeight={27}
                className={block('table')}
                onWrapperScroll={props.onSidebarScroll}
                scrollRef={props.sidebarRef}
            />
        </div>
    );
}
