import {ActionD, YTError} from '../../../../types';
import {REMOTE_COPY_MODAL_PARTIAL} from '../../../../constants/navigation/modals';

export interface RemoteCopyModalState {
    paths: Array<string>;
    showModal?: boolean;
    attributesMap: Record<string, unknown>;
    error?: YTError;
}

const initialState: RemoteCopyModalState = {
    paths: [],
    attributesMap: {},
};

export default function reducer(
    state = initialState,
    action: RemoteCopyModalStateAction,
): RemoteCopyModalState {
    switch (action.type) {
        case REMOTE_COPY_MODAL_PARTIAL:
            return {...state, ...action.data};
    }
    return state;
}

export type RemoteCopyModalStateAction = ActionD<
    typeof REMOTE_COPY_MODAL_PARTIAL,
    Partial<RemoteCopyModalState>
>;
