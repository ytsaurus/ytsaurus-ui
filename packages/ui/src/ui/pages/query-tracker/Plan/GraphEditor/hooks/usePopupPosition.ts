import {CSSProperties, useEffect, useMemo, useState} from 'react';
import {NodeBlock} from '../canvas/NodeBlock';
import {useBlockGeometry} from './useBlockGeometry';
import {TCameraState} from '@gravity-ui/graph/build/services/camera/CameraService';

type Props = (data: {
    container?: HTMLDivElement | null;
    block?: NodeBlock;
    cameraState: TCameraState;
    varName: string;
}) => CSSProperties;

export const usePopupPosition: Props = ({container, block, cameraState, varName}) => {
    const [popupRect, setPopupRect] = useState<DOMRect | undefined>();

    const geometry = useBlockGeometry({
        container,
        block,
        varName,
    });

    useEffect(() => {
        if (container) {
            setPopupRect(container.getBoundingClientRect());
        }
    }, [container, geometry]);

    return useMemo<CSSProperties>(() => {
        if (!block || !popupRect) return {};

        const blockGeometry = block.getGeometry();
        const height =
            popupRect.height > cameraState.height ? cameraState.height : popupRect.height;
        const yDiff =
            cameraState.relativeHeight -
            (blockGeometry.y + cameraState.relativeY) -
            height / cameraState.scale;

        const needHorizontalSwitch =
            cameraState.relativeWidth -
                popupRect.width / cameraState.scale -
                (blockGeometry.x + cameraState.relativeX) <
            0;

        const xDiff = needHorizontalSwitch
            ? (popupRect.width + 8) / cameraState.scale + blockGeometry.width
            : 0;

        return {
            ...(yDiff < 0 && {top: `${yDiff}px`}),
            ...(xDiff > 0 && {left: `-${xDiff}px`}),
            maxHeight: `${cameraState.height - 5}px`,
        };
    }, [block, cameraState, popupRect]);
};
