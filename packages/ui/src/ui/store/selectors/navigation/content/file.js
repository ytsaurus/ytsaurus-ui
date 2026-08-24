import ypath from '@ytsaurus/interface-helpers/lib/ypath';
import {createSelector} from 'reselect';
import {selectAttributes, selectPath} from '../../../../store/selectors/navigation';
import {selectCurrentClusterConfig} from '../../../../store/selectors/global';
import {selectMergedUiSettings} from '../../../../store/selectors/global/cluster';
import {MAX_FILE_SIZE} from '../../../../constants/navigation/content/file';
import {calculateLoadingStatus} from '../../../../utils/utils';
import {makeDirectDownloadPath} from '../../../../utils/navigation';

export const selectDownloadPath = createSelector(
    [selectPath, selectCurrentClusterConfig, selectMergedUiSettings],
    (cypressPath, clusterConfig, uiSettings) => {
        const path = makeDirectDownloadPath('read_file', {
            clusterConfig,
            uiSettings,
        });
        const query = [
            'path=' + encodeURIComponent(cypressPath),
            'disposition=attachment',
            'dump_error_into_response=true',
        ].join('&');

        return path + '?' + query;
    },
);

export const selectIsEmpty = createSelector(selectAttributes, (attributes) => {
    return ypath.getValue(attributes, '/resource_usage/disk_space') === 0;
});

export const selectIsTooBig = createSelector(selectAttributes, (attributes) => {
    return ypath.getValue(attributes, '/uncompressed_data_size') > MAX_FILE_SIZE;
});

export const selectNavigationFileLoadingStatus = createSelector(
    [
        (store) => store.navigation.content.file.loading,
        (store) => store.navigation.content.file.loaded,
        (store) => store.navigation.content.file.error,
    ],
    (loading, loaded, error) => {
        return calculateLoadingStatus(loading, loaded, error);
    },
);
