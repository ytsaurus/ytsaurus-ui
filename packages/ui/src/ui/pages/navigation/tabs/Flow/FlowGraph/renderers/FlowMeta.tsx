import React from 'react';
import {Flex, Text} from '@gravity-ui/uikit';

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
                        <Text variant="caption-1" color="secondary" ellipsis>
                            {label}
                        </Text>
                        <Text variant="caption-2" style={{lineHeight: '12px'}} ellipsis>
                            {value}
                        </Text>
                    </Flex>
                );
            })}
        </Flex>
    );
}
