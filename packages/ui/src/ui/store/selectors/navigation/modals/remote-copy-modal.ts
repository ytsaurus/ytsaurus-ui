import ypath from '../../../../common/thor/ypath';

import {type RootState} from '../../../../store/reducers';
import {createSelector} from 'reselect';
import {selectCompressionCodecFinder} from '../../../../store/selectors/global/supported-features';

export const selectRemoteCopyModalVisible = (state: RootState) =>
    state.navigation.modals.remoteCopyModal.showModal;
export const selectRemoteCopyModalPaths = (state: RootState) =>
    state.navigation.modals.remoteCopyModal.paths;
export const selectRemoteCopyAttributesMap = (state: RootState) =>
    state.navigation.modals.remoteCopyModal.attributesMap;

export const selectRemoteCopyCodecs = createSelector(
    [selectRemoteCopyModalPaths, selectRemoteCopyAttributesMap, selectCompressionCodecFinder],
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
