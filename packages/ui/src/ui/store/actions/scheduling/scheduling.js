import _ from 'lodash';

import {Toaster} from '@gravity-ui/uikit';

// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {getSchedulingNS} from '../../../store/selectors/settings';
import {toggleFavourite} from '../../../store/actions/favourites';
import {getPools, getTree} from '../../../store/selectors/scheduling/scheduling';
import {
    POOL_GENERAL_TYPE_TO_ATTRIBUTE,
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
import {splitBatchResults} from '../../../utils/utils';
import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';

const toaster = new Toaster();

const setName = (path, newName, prevName) => {
    if (prevName === newName) {
        return Promise.resolve();
    }

    return yt.v3.set({path: `${path}/@name`}, newName);
};

const makeOtherAttributesCommands = (path, values, initialValues) => {
    const initialSortParamsString = initialValues.fifoSortParams.join('|');
    const newSortParamsString = values.fifoSortParams.join('|');

    const commands = [];

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

const setResourceAttributes = (path, values, omittedValues, attribute) => {
    if (_.isEmpty(values) && _.isEmpty(omittedValues)) {
        return Promise.resolve();
    }

    const keyMapper = {userSlots: 'user_slots'};
    const omittedValuesList = _.map(omittedValues, (value, key) => keyMapper[key] || key);
    const preparedValues = _.mapKeys(values, (value, key) => keyMapper[key] || key);

    return ytApiV3Id
        .get(YTApiId.schedulingGetAttrsBeforeEdit, {path: `${path}/@${attribute}`})
        .then((resources) => {
            const result = {...resources, ...preparedValues};
            const input = _.omit(result, omittedValuesList);

            return yt.v3.set({path: `${path}/@${attribute}`}, input);
        })
        .catch((error) => {
            if (error.code === 500) {
                // attribute not found
                return yt.v3.set({path: `${path}/@${attribute}`}, preparedValues);
            }

            return Promise.reject(error);
        });
};

const makeGeneralCommands = (path, values, initialValues) => {
    const isInitial = (value, initialValue) => value === initialValue;
    const isOmitted = (value, omittedValues) =>
        Object.prototype.hasOwnProperty.call(omittedValues, value);

    //const {name: abcServiceName, slug: abcServiceSlug, id} = prepareAbcService(values.abcService);
    const omittedValues = _.pickBy(
        values,
        (value) => value === '' || value === undefined || value === null,
    );

    const commands = [];

    // if (!isInitial(abcServiceSlug, initialValues.abcService?.value)) {
    //     commands.push({
    //         command: abcServiceSlug ? 'set' : 'remove',
    //         parameters: {
    //             path: `${path}/@abc`,
    //         },
    //         input: !abcServiceSlug ? undefined : {
    //             slug: abcServiceSlug,
    //             name: abcServiceName,
    //             id,
    //         },
    //     });
    // }

    if (!isInitial(values.mode, initialValues.mode)) {
        commands.push({
            command: 'set',
            parameters: {
                path: `${path}/@mode`,
            },
            input: values.mode,
        });
    }

    if (!isInitial(values.weight, initialValues.weight)) {
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
                input: Number(values.weight),
            });
        }
    }

    return commands;
};

function isInvalidNumber(value) {
    return value === '' || isNaN(Number(value));
}

function isValidNumber(value) {
    return !isInvalidNumber(value);
}

export function editPool(pool, values, initialValues) {
    return (dispatch, getState) => {
        const state = getState();

        const tree = getTree(state);
        const pools = getPools(state);
        const poolPath = computePoolPath(pool, pools);
        const path = `//sys/pool_trees/${tree}/${poolPath}`;

        const filteredResourceLimitsValues = _.pickBy(values.resourceLimits, isValidNumber);
        const omittedResourceLimitsValues = _.pickBy(values.resourceLimits, isInvalidNumber);
        const resourceLimitsValues = _.mapValues(filteredResourceLimitsValues, (value) =>
            Number(value),
        );
        delete resourceLimitsValues['error-block'];
        delete omittedResourceLimitsValues['error-block'];

        dispatch({type: SCHEDULING_EDIT_POOL_REQUEST});

        const requests = [
            ...makeGeneralCommands(path, values.general, initialValues.general),
            ...makeOtherAttributesCommands(path, values.otherSettings, initialValues.otherSettings),
        ];

        return Promise.all([
            ytApiV3Id.executeBatch(YTApiId.schedulingEditPool, {requests}).then((data) => {
                const {error} = splitBatchResults(data);
                if (error) {
                    return Promise.reject(error);
                }
            }),
            setPoolAttributes({
                poolPath: path,
                values: {
                    ...values.resourceGuarantee,
                    ...values.integralGuarantee,
                    ..._.pick(values.general, Object.keys(POOL_GENERAL_TYPE_TO_ATTRIBUTE)),
                },
                initials: {
                    ...initialValues.resourceGuarantee,
                    ...initialValues.integralGuarantee,
                    ..._.pick(initialValues.general, Object.keys(POOL_GENERAL_TYPE_TO_ATTRIBUTE)),
                },
                tree,
            }),
            setResourceAttributes(
                path,
                resourceLimitsValues,
                omittedResourceLimitsValues,
                'resource_limits',
            ),
        ])
            .then(setName(path, values.general.name, initialValues.general.name))
            .then(() => {
                toaster.add({
                    name: 'edit pool',
                    timeout: 10000,
                    type: 'success',
                    title: `Successfully edited ${pool.name}. Please wait.`,
                });

                dispatch({type: SCHEDULING_EDIT_POOL_SUCCESS});
                dispatch(closeEditModal());
                setTimeout(() => dispatch(loadSchedulingData()), 3000);
            })
            .catch((error) => {
                if (error.code !== yt.codes.CANCELLED) {
                    dispatch({
                        type: SCHEDULING_EDIT_POOL_FAILURE,
                        data: {error},
                    });

                    return Promise.reject();
                }
            });
    };
}

export function openEditModal(item) {
    return {
        type: TOGGLE_EDIT_VISIBILITY,
        data: {
            visibility: true,
            item,
        },
    };
}

export function closeEditModal({cancelled} = {}) {
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

export function changeTree(tree) {
    return (dispatch) => {
        dispatch({
            type: CHANGE_TREE,
            data: {tree},
        });

        dispatch(loadSchedulingData());
    };
}

export function changeTableTreeState(treeState) {
    return {
        type: CHANGE_TABLE_TREE_STATE,
        data: {treeState},
    };
}

export function changePool(pool) {
    return {
        type: CHANGE_POOL,
        data: {pool},
    };
}

export function changeAbcServiceFilter(slug) {
    return {
        type: SCHEDULING_DATA_PARTITION,
        data: {abcServiceFilter: {slug}},
    };
}

export function changeContentMode(evt) {
    return {
        type: CHANGE_CONTENT_MODE,
        data: {
            contentMode: evt.target.value,
        },
    };
}

export function changePoolChildrenFilter(poolChildrenFilter) {
    return {
        type: CHANGE_POOL_CHILDREN_FILTER,
        data: {poolChildrenFilter},
    };
}

export function togglePoolFavourites(pool, tree) {
    return (dispatch, getState) => {
        const value = `${pool}[${tree}]`;
        const parentNS = getSchedulingNS(getState());
        return dispatch(toggleFavourite(value, parentNS));
    };
}
