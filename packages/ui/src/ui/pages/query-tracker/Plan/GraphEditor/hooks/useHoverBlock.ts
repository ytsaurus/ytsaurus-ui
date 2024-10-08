import {useCallback, useEffect, useRef, useState} from 'react';
import {Graph} from '@gravity-ui/graph';
import {GraphMouseEvent} from '@gravity-ui/graph/build/graphEvents';
import {NodeBlock} from '../canvas/NodeBlock';

const OPEN_TIMEOUT = 200;
const CLOSE_TIMEOUT = 300;

export function useHoverBlock(graph: Graph, container: HTMLDivElement | null) {
    const timerId = useRef<number | undefined>(undefined);
    const [block, setBlock] = useState<NodeBlock | undefined>(undefined);

    const handleOnGraphMouseEnter = useCallback(({detail}: GraphMouseEvent) => {
        const targetBlock =
            detail.target instanceof NodeBlock && !detail.target.state.selected
                ? detail.target
                : undefined;

        timerId.current = window.setTimeout(
            () => {
                setBlock(targetBlock as NodeBlock);
            },
            targetBlock ? OPEN_TIMEOUT : CLOSE_TIMEOUT,
        );
    }, []);

    const handleClearTimeout = useCallback(() => {
        clearTimeout(timerId.current);
    }, []);

    const handleClosePopup = useCallback(() => {
        timerId.current = window.setTimeout(() => {
            setBlock(undefined);
        }, CLOSE_TIMEOUT);
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
        graph.on('mouseleave', handleClearTimeout);

        return () => {
            graph.off('mouseenter', handleOnGraphMouseEnter);
            graph.off('mouseleave', handleClearTimeout);
        };
    }, [graph, handleClearTimeout, handleOnGraphMouseEnter]);

    return block;
}
