import {MEDIUM_COLS_PREFIX} from '../../../constants/components/nodes/nodes';

import forEach_ from 'lodash/forEach';

import type {Node} from '../../../store/reducers/components/nodes/nodes/node';
import type {
    NodeRange,
    NodesSetupState,
} from '../../../store/reducers/components/nodes/setup/setup';
import {isRangeFilterDefined} from '../../../store/selectors/components/nodes/nodes';
import type {FIX_MY_TYPE} from '../../../types';

const isCorrectRange = (
    node: Node['IOWeight'] = {},
    {from, to}: NodeRange,
    key: FIX_MY_TYPE,
    isArray = false,
) => {
    if (!node[key]) {
        return from.value === null && to.value === null;
    }

    const nodeValue = isArray ? (node[key] as FIX_MY_TYPE).length : node[key];

    return (
        nodeValue >= (from.value === null ? -Infinity : from.value) &&
        nodeValue <= (to.value === null ? Infinity : to.value)
    );
};

export function createMediumsPredicates(setupFilters: NodesSetupState, mediumList: FIX_MY_TYPE) {
    const {storage} = setupFilters;
    const predicates = [] as Array<(node: Pick<Node, 'IOWeight'>) => boolean>;
    forEach_(mediumList, (medium) => {
        const fromTo =
            storage[(MEDIUM_COLS_PREFIX + medium) as FIX_MY_TYPE as keyof typeof storage];
        if (isRangeFilterDefined(fromTo)) {
            predicates.push((node: Pick<Node, 'IOWeight'>) =>
                isCorrectRange(node.IOWeight, fromTo, medium),
            );
        }
    });
    return predicates;
}
