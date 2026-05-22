import React, {useCallback} from 'react';
import type {RenderRowExtraTools} from '@gravity-ui/react-unipika';
import {nodePathToYPath} from '@gravity-ui/react-unipika';

import {LoadButton} from './LoadButton';

import {useLoadableAttributesHandlers} from './useLoadableAttributesHandlers';

export const useRenderRowExtraTools = (): RenderRowExtraTools => {
    const {getIsPathLoadable, getLoadablePathState, onRequestLoadPath} =
        useLoadableAttributesHandlers();

    return useCallback(
        ({path, value}) => {
            if (!path || !value) {
                return null;
            }

            const ypath = nodePathToYPath(path);
            const isLoadable = getIsPathLoadable(ypath);

            if (!isLoadable) {
                return null;
            }

            const {loaded, loading = false} = getLoadablePathState(ypath);

            if (loaded) {
                return null;
            }

            return (
                <LoadButton ypath={ypath} loading={loading} onRequestLoadPath={onRequestLoadPath} />
            );
        },
        [getIsPathLoadable, getLoadablePathState, onRequestLoadPath],
    );
};
