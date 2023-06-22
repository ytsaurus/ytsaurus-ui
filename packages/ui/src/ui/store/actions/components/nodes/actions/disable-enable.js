import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {showErrorPopup} from '../../../../../utils/utils';
import {getNodes} from '../../../../../store/actions/components/nodes/nodes';
import {
    CLOSE_DISABLE_MODAL,
    DISABLE_JOBS,
    DISABLE_TABLET_CELLS,
    DISABLE_WRITE_SESSION,
    ENABLE_JOBS,
    ENABLE_TABLET_CELLS,
    ENABLE_WRITE_SESSION,
    OPEN_DISABLE_MODAL,
} from '../../../../../constants/components/nodes/actions/disable-enable';

function setAttribute({host, attr, flag, successType, failType}) {
    return (dispatch) => {
        return yt.v3
            .set({path: `//sys/cluster_nodes/${host}/@${attr}`}, flag)
            .then(() => {
                dispatch(getNodes());
                dispatch({type: successType});
                dispatch({type: CLOSE_DISABLE_MODAL});
            })
            .catch((error) => {
                dispatch({type: failType});
                dispatch({type: CLOSE_DISABLE_MODAL});
                showErrorPopup(error);
            });
    };
}

export function openDisableModal(data) {
    return {
        type: OPEN_DISABLE_MODAL,
        data,
    };
}

export function closeDisableModal() {
    return {
        type: CLOSE_DISABLE_MODAL,
    };
}

export function disableWriteSession(host) {
    return (dispatch) => {
        dispatch({type: DISABLE_WRITE_SESSION.REQUEST});

        dispatch(
            setAttribute({
                host,
                attr: 'disable_write_sessions',
                flag: true,
                successType: DISABLE_WRITE_SESSION.SUCCESS,
                failType: DISABLE_WRITE_SESSION.FAILURE,
            }),
        );
    };
}

export function enableWriteSession(host) {
    return (dispatch) => {
        dispatch({type: ENABLE_WRITE_SESSION.REQUEST});

        dispatch(
            setAttribute({
                host,
                attr: 'disable_write_sessions',
                flag: false,
                successType: ENABLE_WRITE_SESSION.SUCCESS,
                failType: ENABLE_WRITE_SESSION.FAILURE,
            }),
        );
    };
}

export function disableTabletCells(host) {
    return (dispatch) => {
        dispatch({type: DISABLE_TABLET_CELLS.REQUEST});

        dispatch(
            setAttribute({
                host,
                attr: 'disable_tablet_cells',
                flag: true,
                successType: DISABLE_TABLET_CELLS.SUCCESS,
                failType: DISABLE_TABLET_CELLS.FAILURE,
            }),
        );
    };
}

export function enableTabletCells(host) {
    return (dispatch) => {
        dispatch({type: ENABLE_TABLET_CELLS.REQUEST});

        dispatch(
            setAttribute({
                host,
                attr: 'disable_tablet_cells',
                flag: false,
                successType: ENABLE_TABLET_CELLS.SUCCESS,
                failType: ENABLE_TABLET_CELLS.FAILURE,
            }),
        );
    };
}

export function disableJobs(host) {
    return (dispatch) => {
        dispatch({type: DISABLE_JOBS.REQUEST});

        dispatch(
            setAttribute({
                host,
                attr: 'disable_scheduler_jobs',
                flag: true,
                successType: DISABLE_JOBS.SUCCESS,
                failType: DISABLE_JOBS.FAILURE,
            }),
        );
    };
}

export function enableJobs(host) {
    return (dispatch) => {
        dispatch({type: ENABLE_JOBS.REQUEST});

        dispatch(
            setAttribute({
                host,
                attr: 'disable_scheduler_jobs',
                flag: false,
                successType: ENABLE_JOBS.SUCCESS,
                failType: ENABLE_JOBS.FAILURE,
            }),
        );
    };
}
