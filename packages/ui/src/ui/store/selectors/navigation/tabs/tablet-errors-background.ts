import {createSelector} from 'reselect';
import {type RootState} from '../../../../store/reducers';
import {calculateLoadingStatus} from '../../../../utils/utils';
import {getPath} from '../../../../store/selectors/navigation/index';

import reduce_ from 'lodash/reduce';

import {type ValueOf, type YTError} from '../../../../types';
import ypath from '../../../../common/thor/ypath';

const selectTabletErrorsErrorCount = (state: RootState) =>
    state.navigation.tabs.tabletErrorsBackground.errorsCount;
const selectTabletErrorsErrorCountPath = (state: RootState) =>
    state.navigation.tabs.tabletErrorsBackground.errorsCountPath;
const selectTabletErrorsRaw = (state: RootState) =>
    state.navigation.tabs.tabletErrorsBackground.tabletErrors;
const selectTabletErrorsPathRaw = (state: RootState) =>
    state.navigation.tabs.tabletErrorsBackground.tabletErrorsPath;

export const selectTabletErrorsViewMode = (state: RootState) =>
    state.navigation.tabs.tabletErrorsBackground.viewMode;

export const selectTabletErrorsLoadingStatus = createSelector(
    [
        (state: RootState) => state.navigation.tabs.tabletErrorsBackground.loading,
        (state: RootState) => state.navigation.tabs.tabletErrorsBackground.loaded,
        (state: RootState) => state.navigation.tabs.tabletErrorsBackground.error,
    ],
    (loading, loaded, error) => {
        return calculateLoadingStatus(loading, loaded, error);
    },
);

export const selectTabletErrorsBackgroundCount = createSelector(
    [getPath, selectTabletErrorsErrorCountPath, selectTabletErrorsErrorCount],
    (path, errorCountPath, errorCount) => {
        if (path !== errorCountPath) {
            return 0;
        }

        return errorCount;
    },
);

export const selectTabletErrors = createSelector(
    [getPath, selectTabletErrorsPathRaw, selectTabletErrorsRaw],
    (path, errPath, errors) => {
        if (path !== errPath) {
            return undefined;
        }

        return errors;
    },
);

export const selectTabletErrorsBackgroundCountNoticeVisbile = createSelector(
    [selectTabletErrorsBackgroundCount, selectTabletErrors],
    (count, data) => {
        const {tablet_errors, replication_errors} = data || {};
        const tabletErrorsCount = calculateSubitemsCount(tablet_errors);
        const replicationErrorsCount = calculateSubitemsCount(replication_errors);

        return count !== tabletErrorsCount + replicationErrorsCount;
    },
);

function calculateSubitemsCount(items?: Record<string, Array<unknown>>) {
    return reduce_(
        items,
        (acc, subItems) => {
            return acc + subItems.length;
        },
        0,
    );
}

type ReplicaId = string;
type TabletId = string;

export const selectTabletErrorsReplicationErrors = createSelector([selectTabletErrors], (data) => {
    return reduce_(
        data?.replication_errors,
        (acc, errors, replicaId) => {
            const errorsByTablet = reduce_(
                errors,
                (errAcc, error) => {
                    const tablet_id = ypath.getValue(error.attributes, '/tablet_id');
                    if (!errAcc[tablet_id]) {
                        errAcc[tablet_id] = [];
                    }
                    errAcc[tablet_id].push(error);
                    return errAcc;
                },
                {} as ValueOf<typeof acc>,
            );
            acc[replicaId] = errorsByTablet;
            return acc;
        },
        {} as Record<ReplicaId, Record<TabletId, Array<YTError>>>,
    );
});
