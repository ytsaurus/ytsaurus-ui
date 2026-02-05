import React from 'react';

import {BlockGroups, BlockState, Graph, Group, TBlock, TRect} from '@gravity-ui/graph';

import {getCssColor} from '../../../utils/get-css-color';
import {YTGraphBlock, YTGraphGroupProps} from '../types';

export function useCustomGroups({
    graph,
    customGroups,
}: Pick<YTGraphGroupProps, 'customGroups'> & {graph: Graph}) {
    React.useEffect(() => {
        if (!customGroups?.length) {
            return undefined;
        }

        const YTGraphGroup = Group.define({
            style: {
                background: getCssColor('--g-color-base-info-light'),
                selectedBackground: getCssColor('--g-color-base-info-light'),
                border: getCssColor('--g-color-line-generic'),
                selectedBorder: getCssColor('--g-color-line-generic'),
            },
            geometry: {padding: [0, 0, 0, 0]},
        });

        const groups = graph.addLayer(BlockGroups, {});
        groups.setGroups(
            customGroups.map(({id, x, y, width, height}) => {
                return {id, rect: {x, y, width, height}, component: YTGraphGroup};
            }),
        );

        return () => {
            graph.detachLayer(groups);
        };
    }, [graph, customGroups]);
}

export function useAutoGroups<B extends YTGraphBlock<string, {}>>({
    graph,
    allowAutoGroups,
}: {
    graph: Graph;
    allowAutoGroups?: boolean;
}) {
    React.useEffect(() => {
        if (!allowAutoGroups) {
            return undefined;
        }

        const YTGraphGroup = Group.define({
            style: {
                background: getCssColor('--g-color-base-info-light'),
                selectedBackground: getCssColor('--g-color-base-info-light'),
                border: getCssColor('--g-color-line-generic'),
                selectedBorder: getCssColor('--g-color-line-generic'),
            },
        });

        const AutoGroups = BlockGroups.withBlockGrouping({
            // Put blocks in groups
            groupingFn: (blocks: Array<BlockState<TBlock>>) => {
                const groups: Record<string, Array<BlockState<TBlock>>> = {};
                blocks.forEach((b) => {
                    const block = b.asTBlock();
                    const {groupId} = block as B;
                    if (!groupId) {
                        return;
                    }

                    if (!groups[groupId]) {
                        groups[groupId] = [];
                    }
                    groups[groupId].push(b);
                });
                return groups;
            },
            // Set how groups look
            mapToGroups: (groupId: string, {rect}: {rect: TRect}) => ({
                id: groupId,
                rect,
                component: YTGraphGroup,
            }),
        });

        // Add groups to graph
        const groupLayer = graph.addLayer(AutoGroups, {});

        return () => {
            graph.detachLayer(groupLayer);
        };
    }, [graph, allowAutoGroups]);
}
