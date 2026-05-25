import {type Action} from 'redux';
import {type YTErrorRaw} from '../../../../@types/types';
import {
    LOAD_TABLET_DATA,
    TABLET_CHANGE_ACTIVE_HISTOGRAM,
    TABLET_CHANGE_CONTENT_MODE,
} from '../../../constants/tablet';
import {mergeStateOnClusterChange} from '../../../store/reducers/utils';
import {type ActionD} from '../../../types';

export type TabletState = {
    loading: boolean;
    loaded: boolean;

    error: boolean;
    errorData?: YTErrorRaw;

    attributes: unknown;
    partitions: Array<unknown>;
    tabletErrors: Array<YTErrorRaw>;
    replicationErrors: Record<string, YTErrorRaw>;
    tablePath: string;
    tabletPath: string;
    unorderedDynamicTable: boolean;
    cellLeadingPeer?: {address: string};
    activeHistogram: 'unmerged_row_count';
    pivotKey: unknown; // undefined or array
    nextPivotKey: unknown; // undefined or array
    stores?: Record<string, unknown>;

    contentMode: 'default' | 'keys';
};

const ephemeralState: Omit<TabletState, 'contentMode'> = {
    loading: false,
    loaded: false,
    error: false,
    errorData: undefined,

    attributes: {},
    partitions: [],
    tabletErrors: [],
    replicationErrors: {},
    tablePath: '',
    tabletPath: '',
    unorderedDynamicTable: false,
    cellLeadingPeer: undefined,
    activeHistogram: 'unmerged_row_count',
    pivotKey: undefined, // undefined or array
    nextPivotKey: undefined, // undefined or array
    stores: undefined,
};

const persistedState: Pick<TabletState, 'contentMode'> = {
    contentMode: 'default',
};

export const initialState = {
    ...ephemeralState,
    ...persistedState,
};

const reducer = (state = initialState, action: TabletAction) => {
    switch (action.type) {
        case LOAD_TABLET_DATA.REQUEST:
            return {...state, loading: true};

        case LOAD_TABLET_DATA.SUCCESS: {
            return {
                ...state,
                ...action.data,
                loaded: true,
                loading: false,
                error: false,
            };
        }

        case LOAD_TABLET_DATA.FAILURE:
            return {
                ...state,
                loading: false,
                error: true,
                errorData: action.data.error,
            };

        case LOAD_TABLET_DATA.CANCELLED:
            return {...state, ...ephemeralState};

        case TABLET_CHANGE_CONTENT_MODE:
            return {...state, ...action.data};

        case TABLET_CHANGE_ACTIVE_HISTOGRAM:
            return {...state, ...action.data};

        default:
            return state;
    }
};

export type TabletAction =
    | Action<typeof LOAD_TABLET_DATA.REQUEST>
    | ActionD<typeof LOAD_TABLET_DATA.SUCCESS, Partial<TabletState>>
    | ActionD<typeof LOAD_TABLET_DATA.FAILURE, {error: YTErrorRaw}>
    | Action<typeof LOAD_TABLET_DATA.CANCELLED>
    | ActionD<typeof TABLET_CHANGE_CONTENT_MODE, Pick<TabletState, 'contentMode'>>
    | ActionD<typeof TABLET_CHANGE_ACTIVE_HISTOGRAM, Pick<TabletState, 'activeHistogram'>>;

export default mergeStateOnClusterChange(ephemeralState, persistedState, reducer);
