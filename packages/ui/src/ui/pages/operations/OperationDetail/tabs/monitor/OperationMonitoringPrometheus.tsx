import React from 'react';
import reduce_ from 'lodash/reduce';
import map_ from 'lodash/map';

import {SegmentedRadioGroup} from '@gravity-ui/uikit';

import {PrometheusDashboardLazy} from '../../../../../containers/PrometheusDashboard/lazy';
import {Toolbar} from '../../../../../components/WithStickyToolbar/Toolbar/Toolbar';
import {OperationMonitoringTabProps} from '../../../../../UIFactory';

export function OperationMonitoringPrometheus({cluster, operation}: OperationMonitoringTabProps) {
    const {pools, startTime, finishTime} = operation;

    const [currentTree, setCurrentTree] = React.useState(pools?.[0]?.tree);

    const params = React.useMemo(() => {
        return reduce_(
            pools,
            (acc, item) => {
                const {pool, tree, slotIndex: slot_index} = item;
                acc[tree] = {pool, tree, slot_index: String(slot_index), cluster};
                return acc;
            },
            {} as Record<
                string,
                {pool: string; tree: string; slot_index?: string; cluster: string}
            >,
        );
    }, [pools, cluster]);

    const currentParams = params?.[currentTree ?? ''];

    const showToolbar = pools?.length! > 1;

    return (
        <>
            {showToolbar && (
                <Toolbar
                    marginTopSkip
                    itemsToWrap={[
                        {
                            node: (
                                <SegmentedRadioGroup
                                    value={currentTree}
                                    options={map_(pools, ({tree}) => {
                                        return {value: tree, content: tree};
                                    })}
                                    onUpdate={setCurrentTree}
                                />
                            ),
                        },
                    ]}
                />
            )}
            <PrometheusDashboardLazy
                type="scheduler-operation"
                params={currentParams}
                timeRange={Object.assign(
                    {from: new Date(startTime!).getTime()},
                    finishTime ? {to: new Date(finishTime).getTime()} : {},
                )}
            />
        </>
    );
}
