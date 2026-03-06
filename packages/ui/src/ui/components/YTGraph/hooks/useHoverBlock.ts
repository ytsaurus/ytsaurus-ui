import {useCallback, useEffect, useRef, useState} from 'react';
import {CanvasBlock, Graph, TBlock} from '@gravity-ui/graph';
import {GraphMouseEvent} from '@gravity-ui/graph/build/graphEvents';

const TIMEOUT = 300;
const CLOSE_DELAY = 300;

export function useHoverBlock<B extends TBlock>(
    graph: Graph,
    container: HTMLDivElement | null,
    isBlockNode: (v: any) => v is CanvasBlock<B>,
) {
    const timerId = useRef<number | undefined>(undefined);
    const [block, setBlock] = useState<CanvasBlock<B> | undefined>(undefined);

    const handleClosePopup = useCallback(() => {
        if (timerId.current) clearTimeout(timerId.current);
        timerId.current = window.setTimeout(() => {
            setBlock(undefined);
        }, CLOSE_DELAY);
    }, []);

    const handleOnGraphMouseEnter = useCallback(
        ({detail}: GraphMouseEvent) => {
            const targetBlock = isBlockNode(detail.target) ? detail.target : undefined;

            clearTimeout(timerId.current);

            if (targetBlock) {
                timerId.current = window.setTimeout(() => {
                    setBlock(targetBlock);
                }, TIMEOUT);
            } else {
                handleClosePopup();
            }
        },
        [handleClosePopup, isBlockNode],
    );

    const handleClearTimeout = useCallback(() => {
        clearTimeout(timerId.current);
    }, []);

    useEffect(() => {
        if (!container) return () => {};
        container.addEventListener('mouseenter', handleClearTimeout);
        container.addEventListener('mouseleave', handleClosePopup);

        return () => {
            container.removeEventListener('mouseenter', handleClearTimeout);
            container.removeEventListener('mouseleave', handleClosePopup);
        };
    }, [container, handleClearTimeout, handleClosePopup]);

    useEffect(() => {
        graph.on('mouseenter', handleOnGraphMouseEnter);
        graph.on('mouseleave', handleClosePopup);

        return () => {
            graph.off('mouseenter', handleOnGraphMouseEnter);
            graph.off('mouseleave', handleClosePopup);
        };
    }, [graph, handleClosePopup, handleOnGraphMouseEnter]);

    return {block, handleClearTimeout, handleClosePopup};
}
