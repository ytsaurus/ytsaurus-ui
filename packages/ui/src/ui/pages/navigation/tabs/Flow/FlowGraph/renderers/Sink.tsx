import React from 'react';

import {Flex} from '@gravity-ui/uikit';

import {FlowGraphBlockItem} from '../FlowGraph';
import {FlowCaption1, FlowCaption2, FlowIcon, FlowMessages} from './FlowGraphRenderer';

type SinknProps = {
    className?: string;

    detailed?: boolean;

    item: FlowGraphBlockItem<'sink'>;
};

export function Sink({className, item, detailed}: SinknProps) {
    return (
        <div className={className}>
            <Flex gap={1} alignItems="center" style={{paddingBottom: '10px'}} overflow="hidden">
                <FlowIcon data={item.icon} />
                <FlowCaption2 text={item.name} />
            </Flex>

            <FlowCaption1 text={item.meta.description} />

            {detailed && <FlowMessages data={item.meta.messages} />}
        </div>
    );
}
