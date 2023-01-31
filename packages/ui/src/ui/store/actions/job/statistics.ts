import * as JOB from '../../../constants/job';

export interface CollapseTableAction {
    type: typeof JOB.COLLAPSE_TABLE;
}

export interface ExpandTableAction {
    type: typeof JOB.EXPAND_TABLE;
}

export interface MixTableAction {
    type: typeof JOB.MIX_TABLE;
}

export interface ChangeFilterAction {
    type: typeof JOB.CHANGE_FILTER;
    data: {
        filter: string;
    };
}

export type StatisticsActionType =
    | CollapseTableAction
    | ExpandTableAction
    | MixTableAction
    | ChangeFilterAction;

export function collapseTable(): CollapseTableAction {
    return {
        type: JOB.COLLAPSE_TABLE,
    };
}

export function expandTable(): ExpandTableAction {
    return {
        type: JOB.EXPAND_TABLE,
    };
}

export function mixTable(): MixTableAction {
    return {
        type: JOB.MIX_TABLE,
    };
}

export function changeFilter(filter: string): ChangeFilterAction {
    return {
        type: JOB.CHANGE_FILTER,
        data: {filter},
    };
}
