import {type RootState} from '../../../reducers';

export const selectDownloadTableInfo = (state: RootState, id: string) =>
    state.navigation.content.downloadManager.downloads[id];
