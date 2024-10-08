import React, {FC, useCallback, useEffect, useState} from 'react';
import {Graph} from '@gravity-ui/graph';
import cn from 'bem-cn-lite';
import './Zoom.scss';
import {ZoomButton} from './ZoomButton';
import MagnifierPlusIcon from '@gravity-ui/icons/svgs/magnifier-plus.svg';
import MagnifierMinusIcon from '@gravity-ui/icons/svgs/magnifier-minus.svg';
import {ScaleStep} from '../enums';
import debounce_ from 'lodash/debounce';

const block = cn('yt-graph-zoom');
const zoomMap = [ScaleStep.Detailed, ScaleStep.Schematic, ScaleStep.Minimalistic];

type Props = {
    graph: Graph;
    layerElement: HTMLElement;
};

export const Zoom: FC<Props> = ({graph, layerElement}) => {
    const [scaleIndex, setScaleIndex] = useState(1);

    const handleZoom = useCallback(
        (direction: 'in' | 'out') => {
            const newIndex = direction === 'out' ? scaleIndex + 1 : scaleIndex - 1;
            if (newIndex < 0 || newIndex >= zoomMap.length) return;

            const scale = zoomMap[newIndex];
            const cameraState = graph.cameraService.getCameraState();
            graph.cameraService.set({...cameraState, scale});
            setScaleIndex(newIndex);
        },
        [graph.cameraService, scaleIndex],
    );

    const onZoom = useCallback(
        (e: WheelEvent) => {
            handleZoom(e.deltaY > 0 ? 'out' : 'in');
            e.preventDefault();
        },
        [handleZoom],
    );

    const debouncedZoom = useCallback(
        (e: WheelEvent) => {
            debounce_(onZoom, 200)(e);
            e.preventDefault();
        },
        [onZoom],
    );

    useEffect(() => {
        layerElement.addEventListener('wheel', debouncedZoom);

        return () => {
            layerElement.removeEventListener('wheel', debouncedZoom);
        };
    }, [debouncedZoom, layerElement]);

    return (
        <div className={block()}>
            <ZoomButton
                icon={MagnifierPlusIcon}
                onClick={() => handleZoom('in')}
                disabled={zoomMap[scaleIndex] === ScaleStep.Detailed}
            />
            <div className={block('size')}>
                <div>1 : {scaleIndex + 1}</div>
            </div>
            <ZoomButton
                icon={MagnifierMinusIcon}
                onClick={() => handleZoom('out')}
                disabled={zoomMap[scaleIndex] === ScaleStep.Minimalistic}
            />
        </div>
    );
};
