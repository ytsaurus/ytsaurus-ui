import ypath from '../../../../../common/thor/ypath';
import {RootState} from '../../../../reducers';

export const getExportsConfigRequestInfo = (state: RootState) => ({
    loading: state.navigation.tabs.queue.exports.loading,
    loaded: state.navigation.tabs.queue.exports.loaded,
    error: state.navigation.tabs.queue.exports.error,
});

export const getExportsConfig = (state: RootState) =>
    ypath.getValue(state.navigation.tabs.queue.exports.config, '/static_export_config');
