import React from 'react';
import {Flex, Skeleton} from '@gravity-ui/uikit';

type Props = {
    amount: number;
    itemHeight?: number;
};

export function WidgetSkeleton(props: Props) {
    const {amount, itemHeight} = props;

    return (
        <Flex direction={'column'} gap={'1'} style={{width: '100%'}}>
            {Array.from({length: amount}).map((_, i) => (
                <Skeleton style={{height: `${itemHeight || 15}px`, width: '100%'}} key={i} />
            ))}
        </Flex>
    );
}
