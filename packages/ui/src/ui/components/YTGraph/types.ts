import {CanvasBlock, ECameraScaleLevel, Graph, TBlock, TConnection, TRect} from '@gravity-ui/graph';
import {HookGraphParams} from '@gravity-ui/graph/react';

export type YTGraphGroupProps = {
    /**
     * Use block.groupId to highlight groups
     */
    allowAutoGroups?: boolean;
    customGroups?: Array<TRect & {id: string}>;
};

export type YTGraphProps<B extends TBlock, C extends TConnection> = {
    className?: string;

    data: YTGraphData<B, C>;
    setScale: (v: ECameraScaleLevel) => void;
    config: HookGraphParams;
    isBlock: (v: unknown) => v is CanvasBlock<B>;
    renderPopup?: ({data}: {data: B}) => React.ReactNode;
    renderBlock?: (props: RenderContentProps<B>) => React.ReactNode;

    toolbox?: boolean;
    toolboxClassName?: string;
    /** When true, zoom on mouse wheel scroll (like vis-network). Default: false */
    zoomOnScroll?: boolean;
    autoCenter?: boolean;
} & YTGraphGroupProps;

export type RenderContentProps<B extends TBlock> = {
    graph: Graph;
    data: B;
    className: string;
    style: React.CSSProperties;
};

export type YTGraphData<B extends TBlock, C extends TConnection> = {
    blocks: Array<B>;
    connections: Array<C>;
};

export type YTGraphBlock<IS, Meta extends Record<string, unknown>> = Omit<
    TBlock<Meta>,
    'id' | 'is' | 'meta' | 'group'
> & {
    id: string;
    is: IS;
    meta: Meta;
    groupId?: string;
    backgroundTheme?: 'info' | 'warning' | 'success' | 'danger';
};
