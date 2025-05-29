import React, {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {Graph, TBlock} from '@gravity-ui/graph';
import {PopupLayer} from './PopupLayer';
import {HoverPopup, HoverPopupProps} from './HoverPopup';

export function PopupPortal<B extends TBlock>({
    graph,
    ...rest
}: {graph?: Graph | null} & Omit<HoverPopupProps<B>, 'graph'>) {
    const [ready, setReady] = useState(false);
    const layerRef = useRef<PopupLayer | null>(null);

    useEffect(() => {
        if (!graph) {
            return;
        }

        layerRef.current = graph.addLayer(PopupLayer, {});
        setReady(true);
    }, [graph]);

    return graph && ready && layerRef.current
        ? createPortal(<HoverPopup {...rest} graph={graph} />, layerRef.current.getHTML())
        : null;
}
