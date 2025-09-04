import {ThunkAction} from 'redux-thunk';

import isEmpty_ from 'lodash/isEmpty';
import map_ from 'lodash/map';
import mapKeys_ from 'lodash/mapKeys';
import mapValues_ from 'lodash/mapValues';
import omit_ from 'lodash/omit';
import pick_ from 'lodash/pick';
import pickBy_ from 'lodash/pickBy';

import {BatchSubRequest} from '../../../../shared/yt-types';

import {RootState} from '../../../store/reducers';
import {splitBatchResults} from '../../../../shared/utils/error';

import {getSchedulingNS} from '../../../store/selectors/settings';
import {toggleFavourite} from '../../../store/actions/favourites';
import {
    SchedulingContentMode,
    getPools,
    getTree,
} from '../../../store/selectors/scheduling/scheduling';
import {SchedulingAction, SchedulingState} from '../../../store/reducers/scheduling/scheduling';
import {
    POOL_GENERAL_TYPE_TO_ATTRIBUTE,
    PoolEditorFormValues,
    computePoolPath,
} from '../../../utils/scheduling/scheduling';

import {
    CHANGE_CONTENT_MODE,
    CHANGE_POOL,
    CHANGE_POOL_CHILDREN_FILTER,
    CHANGE_TABLE_TREE_STATE,
    CHANGE_TREE,
    SCHEDULING_DATA_PARTITION,
    SCHEDULING_EDIT_POOL_CANCELLED,
    SCHEDULING_EDIT_POOL_FAILURE,
    SCHEDULING_EDIT_POOL_REQUEST,
    SCHEDULING_EDIT_POOL_SUCCESS,
    TOGGLE_EDIT_VISIBILITY,
} from '../../../constants/scheduling';
import {loadSchedulingData, setPoolAttributes} from './scheduling-ts';

import {YTApiId, ytApiV3, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {YTErrors} from '../../../rum/constants';
import {PoolTreeNode} from '../../../utils/scheduling/pool-child';
import {SortState} from '../../../types';
import {toaster} from '../../../utils/toaster';

const setName = (path: string, newName?: string, prevName?: string) => {
    if (prevName === newName) {
        return Promise.resolve();
    }

    return ytApiV3.set({path: `${path}/@name`}, newName);
};

const makeOtherAttributesCommands = (
    path: string,
    values: PoolEditorFormValues['otherSettings'],
    initialValues: PoolEditorFormValues['otherSettings'],
) => {
    const initialSortParamsString = initialValues.fifoSortParams.join('|');
    const newSortParamsString = values.fifoSortParams.join('|');

    const commands: Array<BatchSubRequest> = [];

    if (initialValues.forbidImmediateOperations !== values.forbidImmediateOperations) {
        commands.push({
            command: 'set',
            parameters: {
                path: `${path}/@forbid_immediate_operations`,
            },
            input: values.forbidImmediateOperations,
        });
    }

    if (initialValues.createEphemeralSubpools !== values.createEphemeralSubpools) {
        commands.push({
            command: 'set',
            parameters: {
                path: `${path}/@create_ephemeral_subpools`,
            },
            input: values.createEphemeralSubpools,
        });
    }

    if (initialSortParamsString !== newSortParamsString) {
        commands.push({
            command: 'set',
            parameters: {
                path: `${path}/@fifo_sort_parameters`,
            },
            input: values.fifoSortParams,
        });
    }

    return commands;
};

type ResourceLimits = PoolEditorFormValues['resourceLimits'];

const setResourceAttributes = (
    path: string,
    values: Partial<Record<keyof ResourceLimits, number>>,
    omittedValues: Partial<ResourceLimits>,
    attribute: 'resource_limits',
) => {
    if (isEmpty_(values) && isEmpty_(omittedValues)) {
        return Promise.resolve();
    }

    const keyMapper: Record<string, string> = {userSlots: 'user_slots'};
    const omittedValuesList = map_(omittedValues, (_value, key) => keyMapper[key] || key);
    const preparedValues = mapKeys_(values, (_value, key) => keyMapper[key] || key);

    return ytApiV3Id
        .get(YTApiId.schedulingGetAttrsBeforeEdit, {path: `${path}/@${attribute}`})
        .then((resources) => {
            const result = {...resources, ...preparedValues};
            const input = omit_(result, omittedValuesList);

            return ytApiV3.set({path: `${path}/@${attribute}`}, input);
        })
        .catch((error) => {
            if (error.code === 500) {
                // attribute not found
                return ytApiV3.set({path: `${path}/@${attribute}`}, preparedValues);
            }

            return Promise.reject(error);
        });
};

type GeneralValues = PoolEditorFormValues['general'];

const makeGeneralCommands = (
    path: string,
    values: Partial<GeneralValues>,
    initialValues: GeneralValues,
) => {
    const isInitial = (value: unknown, initialValue: unknown) => value === initialValue;
    const isOmitted = (value: string, omittedValues: unknown) =>
        Object.prototype.hasOwnProperty.call(omittedValues, value);

    const omittedValues = pickBy_(
        values,
        (value: string) => value === '' || value === undefined || value === null,
    );

    const commands: Array<BatchSubRequest> = [];

    if (!isInitial(values.mode, initialValues.mode)) {
        commands.push({
            command: 'set' as const,
            parameters: {
                path: `${path}/@mode`,
            },
            input: values.mode,
        });
    }

    if (!isInitial(values.weight?.value, initialValues.weight?.value)) {
        if (isOmitted('weight', omittedValues)) {
            commands.push({
                command: 'remove',
                parameters: {
                    path: `${path}/@weight`,
                },
            });
        } else if (!isInitial(values.weight, initialValues.weight)) {
            commands.push({
                command: 'set',
                parameters: {
                    path: `${path}/@weight`,
                },
                input: Number(values.weight?.value),
            });
        }
    }

    return commands;
};

function isInvalidNumber(value: number | string) {
    return value === '' || isNaN(Number(value));
}

function isValidNumber(value: number | string) {
    return !isInvalidNumber(value);
}

type SchedulingThunk<T> = ThunkAction<T, RootState, unknown, SchedulingAction>;

export function editPool(
    pool: PoolTreeNode,
    values: PoolEditorFormValues,
    initialValues: PoolEditorFormValues,
): SchedulingThunk<Promise<void>> {
    return (dispatch, getState) => {
        const state = getState();

        const tree = getTree(state);
        const pools = getPools(state);
        const poolPath = computePoolPath(pool, pools);
        const path = `//sys/pool_trees/${tree}/${poolPath}`;

        const filteredResourceLimitsValues: Partial<(typeof values)['resourceLimits']> = pickBy_(
            values.resourceLimits,
            isValidNumber,
        );
        const omittedResourceLimitsValues: Partial<(typeof values)['resourceLimits']> = pickBy_(
            values.resourceLimits,
            isInvalidNumber,
        );
        const resourceLimitsValues = mapValues_(filteredResourceLimitsValues, (value) =>
            Number(value),
        );

        dispatch({type: SCHEDULING_EDIT_POOL_REQUEST});

        const requests = [
            ...makeGeneralCommands(path, values.general, initialValues.general),
            ...makeOtherAttributesCommands(path, values.otherSettings, initialValues.otherSettings),
        ];

        return Promise.all([
            ytApiV3Id.executeBatch(YTApiId.schedulingEditPool, {requests}).then((data) => {
                const {error} = splitBatchResults(data, 'Failed to fetch pool details');
                if (error) {
                    return Promise.reject(error);
                }
                return undefined;
            }),
            setPoolAttributes({
                poolPath: path,
                values: {
                    ...values.resourceGuarantee,
                    ...values.integralGuarantee,
                    ...pick_(values.general, Object.keys(POOL_GENERAL_TYPE_TO_ATTRIBUTE)),
                },
                initials: {
                    ...initialValues.resourceGuarantee,
                    ...initialValues.integralGuarantee,
                    ...pick_(initialValues.general, Object.keys(POOL_GENERAL_TYPE_TO_ATTRIBUTE)),
                },
                tree,
            }),
            setResourceAttributes(
                path,
                resourceLimitsValues,
                omittedResourceLimitsValues,
                'resource_limits',
            ),
            setName(path, values.general.name, initialValues.general.name),
        ])
            .then(() => {
                toaster.add({
                    name: 'edit pool',
                    autoHiding: 10000,
                    theme: 'success',
                    title: `Successfully edited ${pool.name}. Please wait.`,
                });

                dispatch({type: SCHEDULING_EDIT_POOL_SUCCESS});
                dispatch(closeEditModal());
                setTimeout(() => dispatch(loadSchedulingData()), 3000);
            })
            .catch((error) => {
                if (error.code !== YTErrors.CANCELLED) {
                    dispatch({
                        type: SCHEDULING_EDIT_POOL_FAILURE,
                        data: {error},
                    });

                    return Promise.reject(error);
                }
                return undefined;
            });
    };
}

export function openEditModal(item: PoolTreeNode) {
    return {
        type: TOGGLE_EDIT_VISIBILITY,
        data: {
            visibility: true,
            item,
        },
    };
}

export function closeEditModal({cancelled}: {cancelled?: boolean} = {}): SchedulingThunk<void> {
    return (dispatch) => {
        dispatch({
            type: TOGGLE_EDIT_VISIBILITY,
            data: {
                visibility: false,
                item: undefined,
            },
        });

        if (cancelled) {
            dispatch({type: SCHEDULING_EDIT_POOL_CANCELLED});
        }
    };
}

export function changeTree(tree: string): SchedulingThunk<void> {
    return (dispatch) => {
        dispatch({
            type: CHANGE_TREE,
            data: {tree},
        });

        dispatch(loadSchedulingData());
    };
}

export function changeTableTreeState(treeState: SchedulingState['treeState']): SchedulingAction {
    return {
        type: CHANGE_TABLE_TREE_STATE,
        data: {treeState},
    };
}

export function changePool(pool: string): SchedulingAction {
    return {
        type: CHANGE_POOL,
        data: {pool},
    };
}

export function schedulingChangeContentMode(contentMode: SchedulingContentMode): SchedulingAction {
    return {type: CHANGE_CONTENT_MODE, data: {contentMode}};
}

export function changePoolChildrenFilter(poolChildrenFilter: string) {
    return {
        type: CHANGE_POOL_CHILDREN_FILTER,
        data: {poolChildrenFilter},
    };
}

export function togglePoolFavourites(pool: string, tree: string): SchedulingThunk<void> {
    return (dispatch, getState) => {
        const value = `${pool}[${tree}]`;
        const parentNS = getSchedulingNS(getState());
        return dispatch(toggleFavourite(value, parentNS));
    };
}

export function schedulingSetSortState(sortState: Array<SortState>): SchedulingAction {
    return {
        type: SCHEDULING_DATA_PARTITION,
        data: {sortState},
    };
}

export function schedulingSetShowAbsResources(showAbsResources: boolean): SchedulingAction {
    return {
        type: SCHEDULING_DATA_PARTITION,
        data: {showAbsResources},
    };
}
