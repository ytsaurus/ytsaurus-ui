import {TCameraState} from '@gravity-ui/graph/build/services/camera/CameraService';

const getScale = (cameraState: TCameraState, cameraSide: number, blockSide: number) => {
    const calculatedScale = Number((cameraSide / blockSide).toFixed(3));

    if (calculatedScale > cameraState.scaleMax) {
        return cameraState.scaleMax;
    } else if (calculatedScale < cameraState.scaleMin) {
        return cameraState.scaleMin;
    }
    return calculatedScale;
};

export const getScaleRelativeDimensions = (
    cameraState: TCameraState,
    width: number,
    height: number,
) => {
    const scaleX = getScale(cameraState, cameraState.height, height);
    const scaleY = getScale(cameraState, cameraState.width, width);

    return Math.min(scaleX, scaleY);
};
