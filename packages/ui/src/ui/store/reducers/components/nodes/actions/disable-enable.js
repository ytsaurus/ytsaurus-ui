import {mergeStateOnClusterChange} from '../../../../../store/reducers/utils';
import {
    WRITE_SESSION,
    OPEN_DISABLE_MODAL,
    CLOSE_DISABLE_MODAL,
    DISABLE_WRITE_SESSION,
    ENABLE_WRITE_SESSION,
    DISABLE_TABLET_CELLS,
    ENABLE_TABLET_CELLS,
    DISABLE_JOBS,
    ENABLE_JOBS,
} from '../../../../../constants/components/nodes/actions/disable-enable';

const initialState = {
    host: '',
    visible: false,
    type: 'disable',
    subject: WRITE_SESSION,

    disablingWriteSession: false,
    enablingWriteSession: false,

    disablingTabletCells: false,
    enablingTabletCells: false,

    disablingJobs: false,
    enablingJobs: false,
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case OPEN_DISABLE_MODAL: {
            const {host, type, subject} = action.data;

            return {...state, host, type, subject, visible: true};
        }

        case CLOSE_DISABLE_MODAL:
            return {...initialState};

        // write session
        case DISABLE_WRITE_SESSION.REQUEST:
            return {...state, disablingWriteSession: true};

        case DISABLE_WRITE_SESSION.SUCCESS:
            return {...state, disablingWriteSession: false};

        case DISABLE_WRITE_SESSION.FAILURE:
            return {...state, disablingWriteSession: false};

        case ENABLE_WRITE_SESSION.REQUEST:
            return {...state, enablingWriteSession: true};

        case ENABLE_WRITE_SESSION.SUCCESS:
            return {...state, enablingWriteSession: false};

        case ENABLE_WRITE_SESSION.FAILURE:
            return {...state, enablingWriteSession: false};

        // tablet cells
        case DISABLE_TABLET_CELLS.REQUEST:
            return {...state, disablingTabletCells: true};

        case DISABLE_TABLET_CELLS.SUCCESS:
            return {...state, disablingTabletCells: false};

        case DISABLE_TABLET_CELLS.FAILURE:
            return {...state, disablingTabletCells: false};

        case ENABLE_TABLET_CELLS.REQUEST:
            return {...state, enablingTabletCells: true};

        case ENABLE_TABLET_CELLS.SUCCESS:
            return {...state, enablingTabletCells: false};

        case ENABLE_TABLET_CELLS.FAILURE:
            return {...state, enablingTabletCells: false};

        // jobs
        case DISABLE_JOBS.REQUEST:
            return {...state, disablingJobs: true};

        case DISABLE_JOBS.SUCCESS:
            return {...state, disablingJobs: false};

        case DISABLE_JOBS.FAILURE:
            return {...state, disablingJobs: false};

        case ENABLE_JOBS.REQUEST:
            return {...state, enablingJobs: true};

        case ENABLE_JOBS.SUCCESS:
            return {...state, enablingJobs: false};

        case ENABLE_JOBS.FAILURE:
            return {...state, enablingJobs: false};

        default:
            return state;
    }
};

export default mergeStateOnClusterChange(initialState, {}, reducer);
