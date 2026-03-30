import {createSelector} from 'reselect';
import {RootState} from '../../../store/reducers';
import {selectCluster} from './cluster';

const selectOngoingEvents = (state: RootState) => state.global.ongoingEvents;

export const getMaintenanceEvent = createSelector(
    [selectCluster, selectOngoingEvents],
    (cluster, ongoing) => {
        if (!ongoing?.events?.length || cluster !== ongoing.cluster) {
            return undefined;
        }

        return ongoing.events.find((item) => {
            try {
                const meta = JSON.parse(item.meta!);
                return meta && meta.show_maintenance_page;
            } catch (err) {
                // eslint-disable-next-line no-console
                console.error('Failed to parse notification meta', err);
                return null;
            }
        });
    },
);
