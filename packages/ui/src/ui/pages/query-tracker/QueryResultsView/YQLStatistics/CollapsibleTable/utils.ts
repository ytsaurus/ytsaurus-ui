import {escapeStringForRegexp} from '../../../Plan/utils';

type Parent = string | null;
export type RowsMap = Record<string, Row>;
export type ScalarElement = string | number;

export interface SortInfo {
    asc: boolean;
    selector: (p: RowTree) => ScalarElement;
}

export interface FilterInfo {
    filter: string;
    selector: (p: RowTree) => ScalarElement;
}

export interface Row {
    name: string;
    parent: Parent;
    key: string;
    level: number;
    children: string[];
    [key: string]: unknown;
}

export interface RowTree extends Pick<Row, 'name' | 'parent' | 'key' | 'level'> {
    children: RowTree[];
}

function mapChildren(node: Row, rowsMap: RowsMap): RowTree[] {
    return node.children.map((key) => {
        return {
            ...rowsMap[key],
            children: mapChildren(rowsMap[key], rowsMap),
        };
    });
}

export function prepareTree(nodes: Row[]): RowTree[] {
    const rowsMap = nodes.reduce((acc: RowsMap, node: Row) => {
        acc[node.key] = node;
        return acc;
    }, {});

    const rootNodes = nodes.filter((node) => node.parent === null);

    return rootNodes.map((node) => {
        return {
            ...node,
            children: mapChildren(node, rowsMap),
        };
    });
}

function compare(a: ScalarElement, b: ScalarElement, asc: boolean): number {
    if (a === undefined || a > b) {
        return asc ? 1 : -1;
    }

    if (b === undefined || a < b) {
        return asc ? -1 : 1;
    }

    return 0;
}

function sort(nodes: RowTree[], sortInfo: SortInfo): RowTree[] {
    const {asc, selector} = sortInfo;

    if (selector) {
        return nodes.sort((left: RowTree, right: RowTree) => {
            return compare(selector(left), selector(right), asc);
        });
    }

    return nodes;
}

export function sortTree(nodes: RowTree[], sortInfo: SortInfo): RowTree[] {
    if (nodes.length === 0) {
        return [];
    }

    const sorted = sort(nodes, sortInfo);
    return sorted.map((node) => {
        return {
            ...node,
            children: sortTree(node.children, sortInfo),
        };
    });
}

export function filterTree(tree: RowTree[], filterInfo: FilterInfo): RowTree[] {
    const {filter, selector} = filterInfo;

    const preparedFilter = escapeStringForRegexp(filter).replace(/\s+/g, '.*?');
    const filterRe = new RegExp(preparedFilter, 'i');
    return filterTreeRecursive(tree, filterRe, selector);
}

function filterTreeRecursive(tree: RowTree[], filterRe: RegExp, selector: FilterInfo['selector']) {
    return tree.filter((node) => {
        const isCorrectNode = filterRe.test(String(selector(node)));

        if (isCorrectNode) {
            return true;
        }

        node.children = filterTreeRecursive(node.children, filterRe, selector);
        return node.children.length > 0;
    });
}

function prepareRow(node: RowTree): Row {
    return {
        ...node,
        children: node.children.map((nodeChild) => nodeChild.key),
    };
}

export function flattenTree(tree: RowTree[]): Row[] {
    return tree.reduce((res: Row[], node) => {
        return [...res, prepareRow(node), ...flattenTree(node.children)];
    }, []);
}

export function copyTree(tree: RowTree[]): RowTree[] {
    return [...tree].map((row) => ({
        ...row,
        children: copyTree(row.children),
    }));
}
