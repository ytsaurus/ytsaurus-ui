import {useCallback, useEffect, useState} from 'react';
import {NodeBlock} from '../canvas/NodeBlock';
import {TRect} from '@gravity-ui/graph';

export const useBlockGeometry = ({
    container,
    block,
    varName,
}: {
    container?: HTMLDivElement | null;
    block?: NodeBlock;
    varName: string;
}) => {
    const [geometry, setGeometry] = useState<TRect | undefined>();
    const setSizes = useCallback(
        (blockRect?: TRect) => {
            setGeometry(blockRect);
            container?.style.setProperty(`${varName}-x`, `${blockRect?.x || 0}px`);
            container?.style.setProperty(`${varName}-y`, `${blockRect?.y || 0}px`);
            container?.style.setProperty(`${varName}-width`, `${blockRect?.width || 0}px`);
            container?.style.setProperty(`${varName}-height`, `${blockRect?.height || 0}px`);
        },
        [container?.style, varName],
    );

    useEffect(() => {
        if (!block) {
            setSizes(undefined);
            return () => {};
        }

        setSizes(block.connectedState.$geometry.value);
        return block.connectedState.$geometry.subscribe((nextGeometry) => {
            setSizes(nextGeometry);
        });
    }, [block, setSizes, container]);

    return geometry;
};
