import {createSelector} from 'reselect';
import {RootState} from '../../../store/reducers';
import {getCluster} from './cluster';

const getOngoingEvents = (state: RootState) => state.global.ongoingEvents;

export const getMaintenanceEvent = createSelector(
    [getCluster, getOngoingEvents],
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
