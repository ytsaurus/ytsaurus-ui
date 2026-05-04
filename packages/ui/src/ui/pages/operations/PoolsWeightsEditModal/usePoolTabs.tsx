import React, {useMemo} from 'react';
import cn from 'bem-cn-lite';

import {YTErrorBlock} from '../../../components/Error/Error';
import {PoolPermissionsWarning} from '../../../components/PermissionsWarning';
import isEmpty_ from 'lodash/isEmpty';

import {type OperationPool} from '../selectors';
import {isPositiveOrZeroNumber} from '../../../../shared/utils/toolkit';
import i18n from './i18n';

const block = cn('operation-pools-weights');

function makeError(error: unknown) {
    return isEmpty_(error) ? null : (
        <YTErrorBlock className={block('error')} error={error as Error} />
    );
}

type UsePoolTabsParams = {
    pools: OperationPool[];
    editable: boolean;
    showPermissionWarning: boolean;
    errorByTree: Record<string, unknown>;
    checkPermError: unknown;
};

export function usePoolTabs({
    pools,
    editable,
    showPermissionWarning,
    errorByTree,
    checkPermError,
}: UsePoolTabsParams) {
    return useMemo(() => {
        return pools.map((item) => {
            const tree = item.tree;
            return {
                type: 'tab-vertical' as const,
                name: tree,
                title: tree,
                fields: [
                    {
                        type: 'block' as const,
                        name: 'tree-info',
                        extras: {
                            children: (
                                <div className={block('tree-info')}>
                                    <span className={block('tree-label')}>
                                        {i18n('label_tree')}{' '}
                                    </span>
                                    <span className={block('tree-value')}>{tree}</span>
                                </div>
                            ),
                        },
                    },
                    {
                        name: 'pool',
                        type: 'text' as const,
                        caption: i18n('field_pool'),
                        extras: {
                            disabled: !editable,
                        },
                    },
                    {
                        name: 'weight',
                        type: 'number' as const,
                        caption: i18n('field_weight'),
                        extras: {
                            min: 0,
                            hidePrettyValue: true,
                            disabled: !editable,
                        },
                    },
                    {
                        name: 'cpu',
                        type: 'number' as const,
                        caption: i18n('field_cpu'),
                        extras: {
                            min: 0,
                            hidePrettyValue: true,
                            disabled: !editable,
                        },
                    },
                    {
                        name: 'gpu',
                        type: 'number' as const,
                        caption: i18n('field_gpu'),
                        extras: {
                            min: 0,
                            hidePrettyValue: true,
                            disabled: !editable,
                        },
                    },
                    {
                        name: 'memory',
                        type: 'bytes' as const,
                        caption: i18n('field_memory'),
                        extras: {
                            disabled: !editable,
                        },
                        validator: (value: number | undefined) => {
                            if (value && !isPositiveOrZeroNumber(value)) {
                                return i18n('validation_incorrect-value');
                            }
                            return undefined;
                        },
                    },
                    {
                        name: 'user_slots',
                        type: 'number' as const,
                        caption: i18n('field_user-slots'),
                        extras: {
                            min: 0,
                            hidePrettyValue: true,
                            disabled: !editable,
                        },
                    },
                    {
                        type: 'block' as const,
                        name: 'perm-warning',
                        extras: {
                            children: showPermissionWarning ? <PoolPermissionsWarning /> : null,
                        },
                    },
                    {
                        type: 'block' as const,
                        name: 'error-data',
                        extras: {
                            children: makeError(errorByTree[tree]),
                        },
                    },
                    {
                        type: 'block' as const,
                        name: 'check-perm-error',
                        extras: {
                            children: makeError(checkPermError),
                        },
                    },
                ],
            };
        });
    }, [pools, editable, showPermissionWarning, errorByTree, checkPermError]);
}
