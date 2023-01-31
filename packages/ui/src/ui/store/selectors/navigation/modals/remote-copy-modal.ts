import ypath from '../../../../common/thor/ypath';

import {RootState} from '../../../../store/reducers';
import {createSelector} from 'reselect';
import {makeCompressionCodecFinder} from '../../../../store/selectors/global/supported-features';

export const getRemoteCopyModalVisible = (state: RootState) =>
    state.navigation.modals.remoteCopyModal.showModal;
export const getRemoteCopyModalPaths = (state: RootState) =>
    state.navigation.modals.remoteCopyModal.paths;
export const getRemoteCopyAttributesMap = (state: RootState) =>
    state.navigation.modals.remoteCopyModal.attributesMap;

export const getRemoteCopyCodecs = createSelector(
    [getRemoteCopyModalPaths, getRemoteCopyAttributesMap, makeCompressionCodecFinder],
    (paths, attributesMap, findCompressionCodec) => {
        for (const path of paths) {
            const map = attributesMap[path];
            if (map) {
                const compCodec = findCompressionCodec(
                    ypath.getValue(map, '/compression_codec') as string,
                );

                return {
                    compression_codec: compCodec,
                    erasure_codec: ypath.getValue(map, '/erasure_codec') as string,
                };
            }
        }
        return {};
    },
);
