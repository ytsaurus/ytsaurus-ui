import {RootState} from '../../../reducers';

export const getDownloadTableInfo = (state: RootState, id: string) =>
    state.navigation.content.downloadManager.downloads[id];
