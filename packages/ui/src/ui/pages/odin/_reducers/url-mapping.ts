import moment from 'moment';
import produce from 'immer';

import {initialState as detailsInitialState} from './odin-details';
import {initialState as overviewInitialState} from './odin-overview';
import {DATE_FORMAT} from '../odin-constants';
import {updateIfChanged} from '../../../utils/utils';
import {LocationParameters} from '../../../store/location';
import {FIX_MY_TYPE} from '../../../types';
import {OdinRootState} from '.';

export const odinParams: LocationParameters = {
    metric: {
        stateKey: 'odin.details.metric',
    },
    currentDate: {
        stateKey: 'odin.details.useCurrentDate',
        initialState: detailsInitialState.useCurrentDate,
        type: 'bool',
    },
    date: {
        stateKey: 'odin.details.date',
        initialState: detailsInitialState.date,
        options: {
            serialize: (date: number) => {
                return moment(date).unix();
            },
            parse: (dateFromUrl: string) => {
                const date = moment.unix(dateFromUrl as FIX_MY_TYPE);
                if (date.isValid()) {
                    return date.format(DATE_FORMAT);
                }
                return moment().format(DATE_FORMAT);
            },
        },
    },
    hours: {
        stateKey: 'odin.details.hours',
        initialState: detailsInitialState.hours,
        type: 'number',
    },
    minutes: {
        stateKey: 'odin.details.minutes',
        initialState: detailsInitialState.minutes,
        type: 'number',
    },
};

export const odinIndependentParams = {
    cluster: {
        stateKey: 'odin.details.odinCluster',
        initialState: detailsInitialState.odinCluster,
    },
    ...odinParams,
};

export const odinOverviewParams = {
    cluster: {
        stateKey: 'odin.details.odinCluster',
        initialState: overviewInitialState.dataCluster,
    },
    date: {
        stateKey: 'odin.overview.timeFromFilter',
        initialState: overviewInitialState.timeFromFilter,
        type: 'number',
    },
};

export function getOdinPreparedState(state: OdinRootState, {query}: {query: OdinRootState}) {
    return produce(state, (draft) => {
        const dst = draft.odin.details;
        const src = query.odin.details;
        updateIfChanged(dst, 'metric', src.metric);
        updateIfChanged(dst, 'useCurrentDate', src.useCurrentDate);
        updateIfChanged(dst, 'date', src.date);
        updateIfChanged(dst, 'hours', src.hours);
        updateIfChanged(dst, 'minutes', src.minutes);
        updateIfChanged(dst, 'odinCluster', src.odinCluster);
    });
}

export function getOdinOverviewPreparedState(
    state: OdinRootState,
    {query}: {query: OdinRootState},
) {
    return produce(state, (draft) => {
        updateIfChanged(draft.odin.overview, 'timeFromFilter', query.odin.overview.timeFromFilter);
        updateIfChanged(draft.odin.details, 'odinCluster', query.odin.details.odinCluster);
    });
}
