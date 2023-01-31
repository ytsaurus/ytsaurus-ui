import {createSelector} from 'reselect';

import {COMPONENTS_NODES_NODE_TABLE_ID} from '../../../../constants/components/nodes/nodes';
import type {RootState} from '../../../../store/reducers';
import type {Node} from '../../../../store/reducers/components/nodes/nodes/node';
import {nodeTableProps} from '../../../../utils/components/nodes/node';
import hammer from '../../../../common/hammer';

const getSortState = (state: RootState) => state.tables[COMPONENTS_NODES_NODE_TABLE_ID];
const getTabletSlots = (_state: RootState, props: {node: Pick<Node, 'tabletSlots'>}) =>
    props.node.tabletSlots;

export const getSortedItems = createSelector(
    [getSortState, getTabletSlots],
    (sortState, tabletSlots) =>
        tabletSlots
            ? hammer.utils.sort(tabletSlots.raw, sortState, nodeTableProps.columns.items)
            : [],
);
