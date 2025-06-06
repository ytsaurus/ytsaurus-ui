import React from 'react';
import {Flex, Text} from '@gravity-ui/uikit';

export function FlowMeta({
    items,
    className,
}: {
    className?: string;
    items: Array<{label: string; value: string}>;
}) {
    return (
        <Flex className={className}>
            {items.map(({label, value}, index) => {
                return (
                    <Flex key={index} grow={index < items.length - 1 ? 1 : 0} direction="column">
                        <Text variant="caption-1" color="secondary">
                            {label}
                        </Text>
                        <Text variant="caption-2" style={{lineHeight: '12px'}}>
                            {value}
                        </Text>
                    </Flex>
                );
            })}
        </Flex>
    );
}
