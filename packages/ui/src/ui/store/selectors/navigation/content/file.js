import ypath from '@ytsaurus/interface-helpers/lib/ypath';
import {createSelector} from 'reselect';
import {getAttributes, getPath} from '../../../../store/selectors/navigation';
import {getCurrentClusterConfig} from '../../../../store/selectors/global';
import {MAX_FILE_SIZE} from '../../../../constants/navigation/content/file';
import {calculateLoadingStatus} from '../../../../utils/utils';
import {makeDirectDownloadPath} from '../../../../utils/navigation';

export const getDownloadPath = createSelector(
    [getPath, getCurrentClusterConfig],
    (cypressPath, {id: cluster, proxy, externalProxy}) => {
        const path = makeDirectDownloadPath('read_file', {cluster, proxy, externalProxy});
        const query = [
            'path=' + encodeURIComponent(cypressPath),
            'disposition=attachment',
            'dump_error_into_response=true',
        ].join('&');

        return path + '?' + query;
    },
);

export const getIsEmpty = createSelector(getAttributes, (attributes) => {
    return ypath.getValue(attributes, '/resource_usage/disk_space') === 0;
});

export const getIsTooBig = createSelector(getAttributes, (attributes) => {
    return ypath.getValue(attributes, '/uncompressed_data_size') > MAX_FILE_SIZE;
});

export const getNavigationFileLoadingStatus = createSelector(
    [
        (store) => store.navigation.content.file.loading,
        (store) => store.navigation.content.file.loaded,
        (store) => store.navigation.content.file.error,
    ],
    (loading, loaded, error) => {
        return calculateLoadingStatus(loading, loaded, error);
    },
);
