import React, {useEffect, useState} from 'react';
import {Flex, Skeleton} from '@gravity-ui/uikit';

type Props = {
    itemHeight: number;
};

export function WidgetSkeleton(props: Props) {
    const {itemHeight} = props;
    const [element, setElement] = useState<HTMLDivElement | null>(null);
    const [linesCount, setLinesCount] = useState(0);

    useEffect(() => {
        if (element) {
            const containerHeight = element.clientHeight;
            const calculatedCount = Math.floor(containerHeight / itemHeight);
            setLinesCount(Math.max(1, calculatedCount));
        }
    }, [element, itemHeight]);

    return (
        <Flex
            direction={'column'}
            gap={1}
            ref={setElement}
            style={{
                width: '100%',
                height: '100%',
            }}
        >
            {Array.from({length: linesCount}).map((_, index) => (
                <Skeleton
                    key={index}
                    style={{
                        height: `${itemHeight}px`,
                        width: '100%',
                    }}
                />
            ))}
        </Flex>
    );
}
