import {createSelector} from 'reselect';
import {RootState} from '../../../store/reducers';

const selectOngoingEvents = (state: RootState) => state.global.ongoingEvents;

export const selectMaintenanceEvent = createSelector(
    [
        selectOngoingEvents,
        /**
         * Do not use `selectCluster` here it may return an empty string when a cluster is unavailable.
         * `selectCluster` returns empty string until initialization is finished, unavailable cluster cannot be initialized.
         */
    ],
    (ongoing) => {
        const {events, cluster} = ongoing ?? {};

        const event = events?.find((item) => {
            try {
                const meta = JSON.parse(item.meta!);
                return meta && meta.show_maintenance_page;
            } catch (err) {
                // eslint-disable-next-line no-console
                console.error('Failed to parse notification meta', err);
                return null;
            }
        });

        return {cluster, event};
    },
);
