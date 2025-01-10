import {RootState} from '../../../reducers';

export const getDownloadTableInfo = (state: RootState, id: string) => ({
    startTime: state.navigation.content.downloadManager.downloads[id].startTime,
    loaded: state.navigation.content.downloadManager.downloads[id].loaded,
    loading: state.navigation.content.downloadManager.downloads[id].loading,
    error: state.navigation.content.downloadManager.downloads[id].error,
});
