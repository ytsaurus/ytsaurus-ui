import _ from 'lodash';
import moment from 'moment';
import produce from 'immer';

import {initialState} from './odin-details';
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
        initialState: initialState.useCurrentDate,
        type: 'bool',
    },
    date: {
        stateKey: 'odin.details.date',
        initialState: initialState.date,
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
        initialState: initialState.hours,
        type: 'number',
    },
    minutes: {
        stateKey: 'odin.details.minutes',
        initialState: initialState.minutes,
        type: 'number',
    },
};

export const odinIndependentParams = {
    cluster: {
        stateKey: 'odin.details.odinCluster',
        initialState: initialState.odinCluster,
    },
    ...odinParams,
};

export const odinOverviewParams = {
    cluster: {
        stateKey: 'odin.details.odinCluster',
        initialState: initialState.odinCluster,
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
