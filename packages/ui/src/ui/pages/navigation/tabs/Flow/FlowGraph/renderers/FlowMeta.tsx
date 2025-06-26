import React from 'react';
import {Flex} from '@gravity-ui/uikit';
import {FlowCaption1, FlowCaption2} from './FlowGraphRenderer';

export function FlowMeta({
    items,
    className,
}: {
    className?: string;
    items: Array<{label: string; value: React.ReactNode}>;
}) {
    return (
        <Flex className={className} gap={2}>
            {items.map(({label, value}, index) => {
                return (
                    <Flex
                        key={index}
                        grow={index < items.length - 1 ? 1 : 0}
                        direction="column"
                        shrink={1}
                        style={{overflow: 'hidden'}}
                    >
                        <FlowCaption1 text={label} />
                        <FlowCaption2 text={value} />
                    </Flex>
                );
            })}
        </Flex>
    );
}
