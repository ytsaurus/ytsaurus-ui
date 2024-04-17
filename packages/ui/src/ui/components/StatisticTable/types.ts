export type Statistic = {
    count: number;
    max: number;
    min: number;
    sum: number;
    last: number;
};

export interface MetricsEntry {
    name: string;
    prefix: string;
    path: string;
}

export interface MetricsEntryLeaf extends MetricsEntry {
    value: Statistic;
}

export interface StatisticTreeInner {
    attributes: {
        name: string;
        path: string;
        prefix: string;
        value?: Statistic;
    };
    children: StatisticTreeInner[];
    name: string;
    parent?: string;
    isLeafNode?: boolean;
    readonly _initedBy: string;
}

export interface MetricsList {
    children: {
        [key: string]: MetricsEntry;
    };
    leaves: {
        [key: string]: MetricsEntryLeaf;
    };
}

export type StatisticTree = {[Key: string]: StatisticTree | Statistic};
