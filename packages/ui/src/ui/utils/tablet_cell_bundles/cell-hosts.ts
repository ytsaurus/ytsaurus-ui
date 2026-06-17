import map_ from 'lodash/map';
import uniq_ from 'lodash/uniq';

import {prepareHost} from '../';

export type CellWithBundle = {
    bundle: string;
    peerAddress: string;
};

export function prepareHostsFromCells(cells: CellWithBundle[]): string {
    return uniq_(map_(cells, ({peerAddress}) => prepareHost(peerAddress)).filter(Boolean))
        .sort()
        .join('|');
}

export function prepareBundleHostsByName(cells: CellWithBundle[]): Record<string, string> {
    const bundleCells: Record<string, CellWithBundle[]> = {};

    for (const cell of cells) {
        if (!cell.bundle) {
            continue;
        }

        if (!bundleCells[cell.bundle]) {
            bundleCells[cell.bundle] = [];
        }

        bundleCells[cell.bundle].push(cell);
    }

    const result: Record<string, string> = {};

    for (const [bundle, cellsOfBundle] of Object.entries(bundleCells)) {
        result[bundle] = prepareHostsFromCells(cellsOfBundle);
    }

    return result;
}
