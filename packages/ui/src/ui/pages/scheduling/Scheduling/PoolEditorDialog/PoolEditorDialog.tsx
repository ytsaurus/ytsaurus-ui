import cn from 'bem-cn-lite';
import React, {useCallback, useMemo} from 'react';

import i18n from './i18n';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';

import isEmpty_ from 'lodash/isEmpty';
import pick_ from 'lodash/pick';
import pickBy_ from 'lodash/pickBy';

import {type DialogField, type FormApi, YTDFDialog} from '../../../../containers/Dialog';
import {YTErrorBlock} from '../../../../containers/Block/Block';

import {closeEditModal, editPool} from '../../../../store/actions/scheduling/scheduling';
import {
    calculatePoolPath,
    getPools,
    getPoolsSelectItems,
    getSchedulingEditItem,
    getSchedulingSourcesOfEditItem,
    getTree,
} from '../../../../store/selectors/scheduling/scheduling';
import {isAbcPoolName, isTopLevelPool} from '../../../../utils/scheduling/pool';
import {
    POOL_GENERAL_TYPE_TO_ATTRIBUTE,
    POOL_INTEGRAL_GUARANTEE_FIELD_TO_ATTR,
    POOL_STRONG_RESOURCE_TYPE_TO_ATTRIBUTE,
    type PoolEditorFormValues,
    getInitialValues,
} from '../../../../utils/scheduling/scheduling';

import {checkUserPermissionsUI} from '../../../../utils/acl/acl-api';
import {selectCluster, selectCurrentUserName} from '../../../../store/selectors/global';
import {getCurrentTreeGpuLimit} from '../../../../store/selectors/scheduling/scheduling-ts';

import Link from '../../../../containers/Link/Link';
import {type RootState} from '../../../../store/reducers';
import {selectSchedulingPoolsMapByName} from '../../../../store/selectors/scheduling/scheduling-pools';

import UIFactory from '../../../../UIFactory';
import ypath from '../../../../common/thor/ypath';
import {createQuotaReqTicketUrl} from '../../../../config';
import {type PoolTreeNode} from '../../../../utils/scheduling/pool-child';
import './PoolEditorDialog.scss';
import {validateNumber} from '../../../../common/hammer/validate-number';

const block = cn('pool-editor-dialog');

function makePermissionWarning(visible: boolean, poolType?: 'root' | 'service' | 'account') {
    if (!visible) {
        return null;
    }

    if (poolType === 'root' || poolType === 'service') {
        return (
            <div className={block('permissions-warning')}>{i18n('alert_auto-generated-pool')}</div>
        );
    }

    return (
        <div className={block('permissions-warning')}>
            {i18n('alert_no-permissions-prefix')} <span className={block('flag')}>inherit_acl</span>{' '}
            {i18n('alert_no-permissions-suffix')}
        </div>
    );
}

function makeError(error: any) {
    return isEmpty_(error) ? null : <YTErrorBlock className={block('error')} error={error} />;
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
    const initialFormValues = useMemo(() => {
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
        return formData;
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
                    ...pick_(general, ['name', 'mode']),
                    weight: general.weight,
                    ...pickBy_(
                        pick_(general, Object.keys(POOL_GENERAL_TYPE_TO_ATTRIBUTE)),
                        (item: {limit: number}, k) => {
                            if (!item) {
                                return false;
                            }
                            const key = k as keyof typeof POOL_GENERAL_TYPE_TO_ATTRIBUTE;
                            const initialValue = initialFormValues.general[key]?.limit;
                            return item.limit !== initialValue;
                        },
                    ),
                },
                resourceGuarantee: pickBy_(
                    pick_(resourceGuarantee, Object.keys(POOL_STRONG_RESOURCE_TYPE_TO_ATTRIBUTE)),
                    (item: {limit: number}, k) => {
                        if (!item) {
                            return false;
                        }
                        const key = k as keyof typeof resourceGuarantee;
                        const initialValue = initialFormValues.resourceGuarantee[key]?.limit;
                        return item.limit !== initialValue;
                    },
                ),
                integralGuarantee: pickBy_(
                    pick_(integralGuarantee, Object.keys(POOL_INTEGRAL_GUARANTEE_FIELD_TO_ATTR)),
                    (item, k) => {
                        if (!item) {
                            return false;
                        }
                        const key = k as keyof typeof integralGuarantee;
                        const initialValue = initialFormValues.integralGuarantee[key];
                        if (typeof item === 'object' && typeof initialValue === 'object') {
                            return item.limit !== initialValue.limit;
                        } else {
                            return item !== initialValue;
                        }
                    },
                ),
                resourceLimits: pick_(resourceLimits, ['cpu', 'gpu', 'memory', 'userSlots']),
                otherSettings: pick_(otherSettings, [
                    'forbidImmediateOperations',
                    'fifoSortParams',
                    'createEphemeralSubpools',
                ]),
            };
            await dispatch(editPool(editItem!, data, initialFormValues));
        },
        [editItem, initialFormValues, dispatch],
    );

    const user = useSelector(selectCurrentUserName);
    const [hasWarning, setHasWarning] = React.useState(false);
    const [checkPermError, setCheckPermError] = React.useState(null);

    React.useEffect(() => {
        setCheckPermError(null);
        if (!editItem?.name) {
            return;
        }
        const pathToCheck = calculatePoolPath(editItem.name, pools, tree);
        checkUserPermissionsUI(pathToCheck, user, ['write'])
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
            children: makePermissionWarning(
                hasWarning,
                ypath.getValue(editItem?.cypressAttributes, '/abc_object_type'),
            ),
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
                    title: i18n('title_general'),
                    fields: [
                        ...transferNotice,
                        {
                            name: 'name',
                            type: 'text',
                            caption: i18n('field_pool-name'),
                            required: true,
                            extras: {
                                placeholder: i18n('field_enter-pool-name'),
                            },
                        },
                        {
                            name: 'parent',
                            type: 'yt-select-single',
                            caption: i18n('field_parent'),
                            tooltip: i18n('context_parent'),
                            required: true,
                            extras: {
                                disabled: true,
                                items: poolsItems,
                                placeholder: i18n('field_select-pool-tree'),
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
                            caption: i18n('field_mode'),
                            required: true,
                            extras: {
                                items: modeItems,
                                placeholder: i18n('field_select-mode'),
                                width: 'max',
                                hideFilter: true,
                            },
                        },
                        {
                            name: 'weight',
                            type: 'number',
                            caption: i18n('field_weight'),
                            extras: {
                                min: Number.MIN_VALUE,
                                hidePrettyValue: true,
                                formatFn: (value) => (value === undefined ? '' : String(value)),
                            },
                        },
                        {
                            name: 'maxOperationCount',
                            type: 'pool-quota-editor',
                            caption: i18n('field_max-operation-count'),
                            extras: {
                                pool: editItem?.name || '',
                                resourceType: 'maxOperationCount',
                                initialLimit: initialFormValues.general.maxOperationCount?.limit,
                                min: 0,
                                max: Infinity,
                                sourcesSkipParent: true,
                                limitInputTitle: i18n('field_limit'),
                            },
                        },
                        {
                            name: 'maxRunningOperationCount',
                            type: 'pool-quota-editor',
                            caption: i18n('field_max-running-operation-count'),
                            extras: {
                                pool: editItem?.name || '',
                                resourceType: 'maxRunningOperationCount',
                                initialLimit:
                                    initialFormValues.general.maxRunningOperationCount?.limit,
                                min: 0,
                                max: Infinity,
                                sourcesSkipParent: true,
                                limitInputTitle: i18n('field_limit'),
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
                    title: i18n('title_strong-guarantee'),
                    fields: [
                        ...transferNotice,
                        {
                            name: 'cpuStrong',
                            type: 'pool-quota-editor',
                            caption: 'CPU',
                            extras: {
                                pool: editItem?.name || '',
                                resourceType: 'cpuStrong',
                                initialLimit: initialFormValues.resourceGuarantee.cpuStrong?.limit,
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
                                              initialFormValues.resourceGuarantee.gpuStrong?.limit,
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
                                initialLimit:
                                    initialFormValues.resourceGuarantee.memoryStrong?.limit,
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
                    title: i18n('title_integral-guarantee'),
                    fields: [
                        ...transferNotice,
                        ...integralTypeNotice,
                        {
                            name: 'guaranteeType',
                            type: 'yt-select-single',
                            caption: i18n('field_guarantee'),
                            extras: {
                                placeholder: i18n('field_integral-guarantee-type'),
                                items: [
                                    {
                                        value: 'none',
                                        text: i18n('value_descendants-only'),
                                    },
                                    {value: 'burst', text: i18n('value_burst')},
                                    {value: 'relaxed', text: i18n('value_relaxed')},
                                ],
                                width: 'max',
                            },
                        },
                        {
                            name: 'burstCpu',
                            type: 'pool-quota-editor',
                            caption: i18n('field_burst-cpu'),
                            extras: {
                                pool: editItem?.name || '',
                                resourceType: 'burstCpu',
                                initialLimit: initialFormValues.integralGuarantee.burstCpu?.limit,
                                decimalPlaces: 2,
                            },
                        },
                        ...(treGpuLimit > 0
                            ? [
                                  {
                                      name: 'burstGpu',
                                      type: 'pool-quota-editor' as const,
                                      caption: i18n('field_burst-gpu'),
                                      extras: {
                                          pool: editItem?.name || '',
                                          resourceType: 'burstGpu' as const,
                                          initialLimit:
                                              initialFormValues.integralGuarantee.burstGpu?.limit,
                                      },
                                  },
                              ]
                            : []),
                        {
                            name: 'flowCpu',
                            type: 'pool-quota-editor',
                            caption: i18n('field_flow-cpu'),
                            extras: {
                                pool: editItem?.name || '',
                                resourceType: 'flowCpu',
                                initialLimit: initialFormValues.integralGuarantee.flowCpu?.limit,
                                decimalPlaces: 2,
                            },
                        },
                        ...(treGpuLimit > 0
                            ? [
                                  {
                                      name: 'flowGpu',
                                      type: 'pool-quota-editor' as const,
                                      caption: i18n('field_flow-gpu'),
                                      extras: {
                                          pool: editItem?.name || '',
                                          resourceType: 'flowGpu' as const,
                                          initialLimit:
                                              initialFormValues.integralGuarantee.flowGpu?.limit,
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
                    title: i18n('title_resource-limits'),
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
                                if (!value) {
                                    return undefined;
                                }
                                return validateNumber({ge: 0}, value);
                            },
                        },
                        {
                            name: 'userSlots',
                            type: 'text',
                            caption: i18n('field_user-slots'),
                        },
                        warningField,
                        poolErrorDataField,
                        checkPermErrorField,
                    ],
                },
                {
                    type: 'tab-vertical',
                    name: 'otherSettings',
                    title: i18n('title_other-settings'),
                    fields: [
                        {
                            name: 'forbidImmediateOperations',
                            type: 'tumbler',
                            caption: i18n('field_forbid-immediate-operations'),
                        },
                        {
                            name: 'fifoSortParams',
                            type: 'sortable-list',
                            caption: i18n('field_fifo-sort-parameters'),
                            extras: {
                                axis: 'x',
                            },
                        },
                        {
                            name: 'createEphemeralSubpools',
                            type: 'tumbler',
                            caption: i18n('field_create-ephemeral-subpools'),
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

function useTransferNotice(editItem?: PoolTreeNode): [DialogField<PoolEditorFormValues>] | [] {
    const {parent} = editItem || {};
    //    const abcInfo = abcInfoFromAttributes(cypressAttributes);
    const poolsByName = useSelector(selectSchedulingPoolsMapByName);
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
    editItem: {name: string; parent?: string} | undefined,
    pools: Array<{name: string; parent?: string}>,
    tree: string,
): [DialogField<PoolEditorFormValues>] | [] {
    const {name, parent} = editItem || {};

    const cluster = useSelector(selectCluster);

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
                        {i18n('context_change-type-notice')}{' '}
                        {url ? <Link url={url}>{queue}</Link> : i18n('context_support-team')}
                    </div>
                ),
            },
        },
    ];
}
