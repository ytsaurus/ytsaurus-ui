import React, {useCallback, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';
import _ from 'lodash';
import {DialogField, FormApi, YTDFDialog} from '../../../../components/Dialog/Dialog';
import Error from '../../../../components/Error/Error';

import {
    calculatePoolPath,
    getPools,
    getPoolsSelectItems,
    getSchedulingEditItem,
    getSchedulingSourcesOfEditItem,
    getTree,
} from '../../../../store/selectors/scheduling/scheduling';
import {
    InitialPoolResourceInfo,
    POOL_GENERAL_TYPE_TO_ATTRIBUTE,
    POOL_INTEGRAL_GUARANTEE_FIELD_TO_ATTR,
    POOL_STRONG_RESOURCE_TYPE_TO_ATTRIBUTE,
    PoolGeneralResourceType,
    PoolIntegralResourceType,
    PoolStrongResourceType,
    getInitialValues,
    isAbcPoolName,
    isTopLevelPool,
} from '../../../../utils/scheduling/scheduling';
import {closeEditModal, editPool} from '../../../../store/actions/scheduling/scheduling';

import {checkUserPermissions} from '../../../../utils/acl/acl-api';
import {getCluster, getCurrentUserName} from '../../../../store/selectors/global';
import {getCurrentTreeGpuLimit} from '../../../../store/selectors/scheduling/scheduling-ts';

import {RootState} from '../../../../store/reducers';
import {
    PoolInfo,
    getSchedulingPoolsMapByName,
} from '../../../../store/selectors/scheduling/scheduling-pools';
import Link from '../../../../components/Link/Link';

import './PoolEditorDialog.scss';
import UIFactory from '../../../../UIFactory';
import {createQuotaReqTicketUrl} from '../../../../config';

const block = cn('pool-editor-dialog');

function makePermissionWarning(visible: boolean) {
    return !visible ? null : (
        <div className={block('permissions-warning')}>
            You do not have sufficient permissions to modify pool settings. In order to be able to
            modify pool settings <span className={block('flag')}>inherit_acl</span> flag should be
            enabled for current pool and you should be responsible for the parent pool.
        </div>
    );
}

function makeError(error: any) {
    return _.isEmpty(error) ? null : <Error className={block('error')} error={error} />;
}

export interface PoolEditorFormValues {
    general: Record<PoolGeneralResourceType, InitialPoolResourceInfo> & {
        weight: {value?: number; error?: string};
    }; // TODO add description for another fields
    resourceGuarantee: Record<PoolStrongResourceType, InitialPoolResourceInfo>;
    integralGuarantee: Record<
        Exclude<PoolIntegralResourceType, 'guaranteeType'>,
        InitialPoolResourceInfo
    > & {guaranteeType?: 'none' | 'burst' | 'relaxed'};
    resourceLimits: {
        cpu: number | string;
        gpu: number | string;
        memory: number | string;
        userSlots: number | string;
    };
    otherSettings: {
        forbidImmediateOperations: boolean;
        fifoSortParams: Array<string>;
        createEphemeralSubpools: boolean;
    };
}

export function PoolEditorDialog() {
    const dispatch = useDispatch();

    const editItem = useSelector(getSchedulingEditItem);
    const {poolErrorData, editVisibility} = useSelector(
        (state: RootState) => state.scheduling.scheduling,
    );

    const treGpuLimit = useSelector(getCurrentTreeGpuLimit);

    const allowedSources = useSelector(getSchedulingSourcesOfEditItem);

    const poolsItems = useSelector(getPoolsSelectItems);
    const pools = useSelector(getPools);
    const tree = useSelector(getTree);
    const modeItems = [
        {key: 'fair_share', value: 'fair_share', title: 'fair_share'},
        {key: 'fifo', value: 'fifo', title: 'fifo'},
    ];
    const [initialValues, initialFormValues] = useMemo(() => {
        const data = getInitialValues(editItem, allowedSources);
        const formData: PoolEditorFormValues = {
            ...data,
            general: {
                ...data.general,
                weight: {
                    value: data.general.weight,
                },
            },
        };
        return [data, formData];
    }, [editItem, allowedSources]); // don't pass pools into memo's array

    const editCloseHandler = useCallback(() => {
        dispatch(closeEditModal({cancelled: true}));
    }, [dispatch]);
    const editConfirmHandler = useCallback(
        async (form: FormApi<PoolEditorFormValues>) => {
            const {values} = form.getState();
            const {general, resourceGuarantee, integralGuarantee, resourceLimits, otherSettings} =
                values;
            const data = {
                general: {
                    ..._.pick(general, ['name', 'mode']),
                    weight: general.weight.value,
                    ..._.pickBy(
                        _.pick(general, Object.keys(POOL_GENERAL_TYPE_TO_ATTRIBUTE)),
                        (item: {limit: number}, k) => {
                            if (!item) {
                                return false;
                            }
                            const key = k as keyof typeof POOL_GENERAL_TYPE_TO_ATTRIBUTE;
                            const initialValue = initialValues.general[key].limit;
                            return item.limit !== initialValue;
                        },
                    ),
                },
                resourceGuarantee: _.pickBy(
                    _.pick(resourceGuarantee, Object.keys(POOL_STRONG_RESOURCE_TYPE_TO_ATTRIBUTE)),
                    (item: {limit: number}, k) => {
                        if (!item) {
                            return false;
                        }
                        const key = k as keyof typeof resourceGuarantee;
                        const initialValue = initialValues.resourceGuarantee[key].limit;
                        return item.limit !== initialValue;
                    },
                ),
                integralGuarantee: _.pickBy(
                    _.pick(integralGuarantee, Object.keys(POOL_INTEGRAL_GUARANTEE_FIELD_TO_ATTR)),
                    (item, k) => {
                        if (!item) {
                            return false;
                        }
                        const key = k as keyof typeof integralGuarantee;
                        const initialValue = initialValues.integralGuarantee[key];
                        if (typeof item === 'object' && typeof initialValue === 'object') {
                            return item.limit !== initialValue.limit;
                        } else {
                            return item !== initialValue;
                        }
                    },
                ),
                resourceLimits: _.pick(resourceLimits, ['cpu', 'gpu', 'memory', 'userSlots']),
                otherSettings: _.pick(otherSettings, [
                    'forbidImmediateOperations',
                    'fifoSortParams',
                    'createEphemeralSubpools',
                ]),
            };
            await dispatch(editPool(editItem, data, initialValues));
        },
        [editItem, initialValues, dispatch],
    );

    const user = useSelector(getCurrentUserName);
    const [hasWarning, setHasWarning] = React.useState(false);
    const [checkPermError, setCheckPermError] = React.useState(null);

    React.useEffect(() => {
        setCheckPermError(null);
        if (!editItem?.name) {
            return;
        }
        const pathToCheck = calculatePoolPath(editItem.name, pools, tree);
        checkUserPermissions(pathToCheck, user, ['write'])
            .then(([{action}]) => {
                const newHasWarning = action !== 'allow';
                if (newHasWarning !== hasWarning) {
                    setHasWarning(newHasWarning);
                }
            })
            .catch((error) => {
                setCheckPermError(error);
            });
    }, [pools, tree, editItem?.name, hasWarning, setHasWarning, setCheckPermError]);

    const warningField: DialogField = {
        type: 'block',
        name: 'perm-warning',
        extras: {
            children: makePermissionWarning(hasWarning),
        },
    };

    const checkPermErrorField: DialogField = {
        type: 'block',
        name: 'check-perm-error',
        extras: {
            children: makeError(checkPermError),
        },
    };

    const poolErrorDataField: DialogField = {
        type: 'block',
        name: 'pool-error-data',
        extras: {
            children: makeError(poolErrorData),
        },
    };

    const transferNotice = useTransferNotice(editItem);

    const integralTypeNotice = useChangeIntegralTypeNotice(editItem, pools, tree);

    return (
        <YTDFDialog<PoolEditorFormValues>
            size="l"
            key={editItem?.name + '/' + editVisibility}
            className={block()}
            visible={editVisibility}
            onClose={editCloseHandler}
            headerProps={{
                title: editItem?.name,
            }}
            onAdd={editConfirmHandler}
            initialValues={initialFormValues}
            fields={[
                {
                    type: 'tab-vertical',
                    name: 'general',
                    title: 'General',
                    fields: [
                        ...transferNotice,
                        {
                            name: 'name',
                            type: 'text',
                            caption: 'Pool name',
                            required: true,
                            extras: {
                                placeholder: 'Enter pool name...',
                            },
                        },
                        {
                            name: 'parent',
                            type: 'yt-select-single',
                            caption: 'Parent',
                            tooltip:
                                'Select parent pool, defining a place in pool_tree to place a new pool.',
                            required: true,
                            extras: {
                                disabled: true,
                                items: poolsItems,
                                placeholder: 'Select pool tree...',
                                width: 'max',
                            },
                        },
                        {
                            name: 'separator',
                            type: 'block',
                            extras: {
                                children: <div className={block('separator')} />,
                            },
                        },
                        {
                            name: 'mode',
                            type: 'yt-select-single',
                            caption: 'Mode',
                            required: true,
                            extras: {
                                items: modeItems,
                                placeholder: 'Select mode...',
                                width: 'max',
                                hideFilter: true,
                            },
                        },
                        {
                            name: 'weight',
                            type: 'number',
                            caption: 'Weight',
                            extras: {
                                min: Number.MIN_VALUE,
                                hidePrettyValue: true,
                                formatFn: (value) => (value === undefined ? '' : String(value)),
                            },
                        },
                        {
                            name: 'maxOperationCount',
                            type: 'pool-quota-editor',
                            caption: 'Max operation count',
                            extras: {
                                pool: editItem?.name || '',
                                resourceType: 'maxOperationCount',
                                initialLimit: initialValues.general.maxOperationCount.limit,
                                min: 0,
                                max: Infinity,
                                sourcesSkipParent: true,
                                limitInputTitle: 'Limit',
                            },
                        },
                        {
                            name: 'maxRunningOperationCount',
                            type: 'pool-quota-editor',
                            caption: 'Max running operation count',
                            extras: {
                                pool: editItem?.name || '',
                                resourceType: 'maxRunningOperationCount',
                                initialLimit: initialValues.general.maxRunningOperationCount.limit,
                                min: 0,
                                max: Infinity,
                                sourcesSkipParent: true,
                                limitInputTitle: 'Limit',
                            },
                        },
                        warningField,
                        poolErrorDataField,
                        checkPermErrorField,
                    ],
                },
                {
                    type: 'tab-vertical',
                    name: 'resourceGuarantee',
                    title: 'Strong Guarantee',
                    fields: [
                        ...transferNotice,
                        {
                            name: 'cpuStrong',
                            type: 'pool-quota-editor',
                            caption: 'CPU',
                            extras: {
                                pool: editItem?.name || '',
                                resourceType: 'cpuStrong',
                                initialLimit: initialValues.resourceGuarantee.cpuStrong.limit,
                                decimalPlaces: 2,
                            },
                        },
                        ...(treGpuLimit > 0
                            ? [
                                  {
                                      name: 'gpuStrong',
                                      type: 'pool-quota-editor' as const,
                                      caption: 'GPU',
                                      extras: {
                                          pool: editItem?.name || '',
                                          resourceType: 'gpuStrong' as const,
                                          initialLimit:
                                              initialValues.resourceGuarantee.gpuStrong.limit,
                                      },
                                  },
                              ]
                            : []),
                        {
                            name: 'memoryStrong',
                            type: 'pool-quota-editor' as const,
                            caption: 'Memory',
                            extras: {
                                format: 'Bytes',
                                pool: editItem?.name || '',
                                resourceType: 'memoryStrong' as const,
                                initialLimit: initialValues.resourceGuarantee.memoryStrong.limit,
                            },
                        },
                        warningField,
                        poolErrorDataField,
                        checkPermErrorField,
                    ],
                },
                {
                    type: 'tab-vertical',
                    name: 'integralGuarantee',
                    title: 'Integral Guarantee',
                    fields: [
                        ...transferNotice,
                        ...integralTypeNotice,
                        {
                            name: 'guaranteeType',
                            type: 'yt-select-single',
                            caption: 'Guarantee',
                            extras: {
                                placeholder: 'Integral guarantee type...',
                                items: [
                                    {
                                        value: 'none',
                                        text: 'Descendants only',
                                    },
                                    {value: 'burst', text: 'Burst'},
                                    {value: 'relaxed', text: 'Relaxed'},
                                ],
                                width: 'max',
                            },
                        },
                        {
                            name: 'burstCpu',
                            type: 'pool-quota-editor',
                            caption: 'Burst CPU',
                            extras: {
                                pool: editItem?.name || '',
                                resourceType: 'burstCpu',
                                initialLimit: initialValues.integralGuarantee.burstCpu.limit,
                                decimalPlaces: 2,
                            },
                        },
                        ...(treGpuLimit > 0
                            ? [
                                  {
                                      name: 'burstGpu',
                                      type: 'pool-quota-editor' as const,
                                      caption: 'Burst GPU',
                                      extras: {
                                          pool: editItem?.name || '',
                                          resourceType: 'burstGpu' as const,
                                          initialLimit:
                                              initialValues.integralGuarantee.burstGpu.limit,
                                      },
                                  },
                              ]
                            : []),
                        {
                            name: 'flowCpu',
                            type: 'pool-quota-editor',
                            caption: 'Flow CPU',
                            extras: {
                                pool: editItem?.name || '',
                                resourceType: 'flowCpu',
                                initialLimit: initialValues.integralGuarantee.flowCpu.limit,
                                decimalPlaces: 2,
                            },
                        },
                        ...(treGpuLimit > 0
                            ? [
                                  {
                                      name: 'flowGpu',
                                      type: 'pool-quota-editor' as const,
                                      caption: 'Flow GPU',
                                      extras: {
                                          pool: editItem?.name || '',
                                          resourceType: 'flowGpu' as const,
                                          initialLimit:
                                              initialValues.integralGuarantee.flowGpu.limit,
                                      },
                                  },
                              ]
                            : []),
                        warningField,
                        poolErrorDataField,
                        checkPermErrorField,
                    ],
                },
                {
                    type: 'tab-vertical',
                    name: 'resourceLimits',
                    title: 'Resource Limits',
                    fields: [
                        {
                            name: 'cpu',
                            type: 'text',
                            caption: 'CPU',
                        },
                        {
                            name: 'gpu',
                            type: 'text',
                            caption: 'GPU',
                        },
                        {
                            name: 'memory',
                            type: 'bytes',
                            caption: 'Memory',
                            validator(value?: number) {
                                if (typeof value !== 'undefined' && isNaN(value)) {
                                    return 'Incorrect value';
                                }
                                return undefined;
                            },
                        },
                        {
                            name: 'userSlots',
                            type: 'text',
                            caption: 'User slots',
                        },
                        warningField,
                        poolErrorDataField,
                        checkPermErrorField,
                    ],
                },
                {
                    type: 'tab-vertical',
                    name: 'otherSettings',
                    title: 'Other settings',
                    fields: [
                        {
                            name: 'forbidImmediateOperations',
                            type: 'tumbler',
                            caption: 'Forbid immediate operations',
                        },
                        {
                            name: 'fifoSortParams',
                            type: 'sortable-list',
                            caption: 'Fifo sort parameters',
                            extras: {
                                axis: 'x',
                            },
                        },
                        {
                            name: 'createEphemeralSubpools',
                            type: 'tumbler',
                            caption: 'Create ephemeral subpools',
                        },
                        warningField,
                        poolErrorDataField,
                        checkPermErrorField,
                    ],
                },
            ]}
        />
    );
}

function useTransferNotice(editItem?: PoolInfo): [DialogField<FormValues>] | [] {
    const {parent} = editItem || {};
    //    const abcInfo = abcInfoFromAttributes(cypressAttributes);
    const poolsByName = useSelector(getSchedulingPoolsMapByName);
    const parentPool = poolsByName[parent!];

    const children = UIFactory.renderTransferQuotaNoticeForPool({
        pool: editItem,
        parentPool,
        isTopLevel: isTopLevelPool(editItem),
    });

    return !children
        ? []
        : [
              {
                  type: 'block' as const,
                  name: 'transferQuotaNotice',
                  extras: {
                      children,
                  },
              },
          ];
}

function useChangeIntegralTypeNotice(
    editItem: PoolInfo | undefined,
    pools: Array<PoolInfo>,
    tree: string,
): [DialogField<FormValues>] | [] {
    const {name, parent} = editItem || {};

    const cluster = useSelector(getCluster);

    if (isAbcPoolName(name) || (!isAbcPoolName(parent) && !isTopLevelPool(editItem))) {
        return [];
    }

    const poolPath = name ? calculatePoolPath(name, pools, tree) : undefined;
    const path = `${poolPath}/@integral_guarantees/guarantee_type`;
    const summary = `[${cluster}]: Change-request of ${path}`;

    const {url, queue} = createQuotaReqTicketUrl({summary});

    return [
        {
            type: 'block' as const,
            name: 'integralTypeNotice',
            extras: {
                children: (
                    <div className={block('changeTypeNotice')}>
                        To change the guarantee type of the pool you have to create a request to{' '}
                        {url ? <Link url={url}>{queue}</Link> : "the cluster's support team"}
                    </div>
                ),
            },
        },
    ];
}
