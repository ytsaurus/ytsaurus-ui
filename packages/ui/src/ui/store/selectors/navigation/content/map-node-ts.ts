import {
    TabletStateAction,
    TabletStateType,
} from '../../../../store/reducers/navigation/modals/dyn-tables-state-modal';

export const DYN_TABLES_ALLOWED_STATES_OF_ACTION: Record<
    TabletStateAction,
    Partial<Record<TabletStateType, boolean>>
> = {
    mount: {
        unmounted: true,
    },
    unmount: {
        mounted: true,
        frozen: true,
    },
    freeze: {
        mounted: true,
    },
    unfreeze: {
        frozen: true,
    },
};

export const DYN_TABLES_ALLOWED_ACTIONS_BY_STATE: Record<
    TabletStateType,
    Partial<Record<TabletStateAction, boolean>>
> = {
    mounted: {
        freeze: true,
        unmount: true,
    },
    unmounted: {
        mount: true,
    },
    frozen: {
        unmount: true,
        unfreeze: true,
    },
    mixed: {
        mount: true,
        unmount: true,
        freeze: true,
        unfreeze: true,
    },
};
