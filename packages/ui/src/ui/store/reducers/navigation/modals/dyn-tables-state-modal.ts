import {ActionD} from '../../../../types';
import {DYN_TABLES_STATE_MODAL_PARTIAL} from '../../../../constants/navigation/modals/dyn-tables-state-modal';

export type TabletStateType = 'mounted' | 'unmounted' | 'frozen' | 'mixed';
export type TabletStateAction = 'mount' | 'unmount' | 'freeze' | 'unfreeze';

export interface DynTablesStateModalState {
    action?: TabletStateAction;
    paths: Array<string>;

    showModal?: boolean;
}

const initialState: DynTablesStateModalState = {
    paths: [],
};

export default function reducer(
    state = initialState,
    action: DynTablesStateModalAction,
): DynTablesStateModalState {
    switch (action.type) {
        case DYN_TABLES_STATE_MODAL_PARTIAL:
            return {...state, ...action.data};
    }
    return state;
}

export type DynTablesStateModalAction = ActionD<
    typeof DYN_TABLES_STATE_MODAL_PARTIAL,
    Partial<DynTablesStateModalState>
>;
