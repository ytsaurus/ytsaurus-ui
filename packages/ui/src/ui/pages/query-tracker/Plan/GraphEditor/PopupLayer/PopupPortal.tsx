import React, {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {Graph} from '@gravity-ui/graph';
import {PopupLayer} from './PopupLayer';
import {HoverPopup} from './HoverPopup';

export function PopupPortal({graph}: {graph?: Graph | null}) {
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
        ? createPortal(<HoverPopup graph={graph} />, layerRef.current.getHTML())
        : null;
}
