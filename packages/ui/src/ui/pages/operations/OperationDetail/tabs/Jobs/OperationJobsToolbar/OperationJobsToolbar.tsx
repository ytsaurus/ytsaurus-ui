import React from 'react';
import {useSelector} from '../../../../../../store/redux-hooks';
import cn from 'bem-cn-lite';

import i18n from './i18n';

import {utils} from '../../../../../../common/hammer/utils';
import JobsSelectFilter from './JobsSelectFilter';
import JobsPaginator from './JobsPaginator';
import JobsFilterBy from './JobsFilterBy';
import JobsAttributesFilter from './JobsAttributesFilter';

import {getShowCompetitiveJobs} from '../../../../../../pages/operations/selectors';
import {selectOperationTasksNames} from '../../../../../../store/selectors/operations/operation';

import {JobsOperationIncarnationsFilter} from './JobsOperationsIncarnationsFilter';
import './OperationJobsToolbar.scss';
import {type RootState} from '../../../../../../store/reducers';

const block = cn('operation-detail-jobs');
const tbBlock = cn('elements-toolbar');

// TODO: make this a selector inside a specific <JobsTypeFilter> component once we start using reselect library
function extractJobTypes(operations: RootState['operations']) {
    const {counters = {}} = operations.jobs.filters.type;
    const keys: Array<string> = utils.sortInPredefinedOrder(['all'], Object.keys(counters));
    return keys.map((name) => {
        return {name};
    });
}

const tbComp = tbBlock('component');

export default function OperationJobsToolbar() {
    const showCompetitiveJobs = useSelector(getShowCompetitiveJobs);

    const taskNames = useSelector(selectOperationTasksNames);
    const allTaskNames = React.useMemo(() => {
        return [
            {name: ''},
            ...taskNames.map((name) => {
                return {name, caption: name};
            }),
        ];
    }, [taskNames]);

    return (
        <div className={block('toolbar')}>
            <div className={tbBlock()}>
                <div className={tbBlock('container')}>
                    <div className={block('toolbar-filter-by', tbComp)}>
                        <JobsFilterBy />
                    </div>
                    <div className={block('toolbar-filter-by', tbComp)}>
                        <JobsSelectFilter
                            name={'taskName'}
                            label={i18n('field_task-name') + ':'}
                            states={allTaskNames}
                            width="max"
                        />
                    </div>
                    <div className={block('toolbar-state', tbComp)}>
                        <JobsSelectFilter
                            name="type"
                            label={i18n('field_type') + ':'}
                            statesProvider={extractJobTypes}
                            disabled={showCompetitiveJobs}
                            width={200}
                        />
                    </div>
                    <div className={block('toolbar-state', tbComp)}>
                        <JobsSelectFilter
                            name="state"
                            label={i18n('field_state') + ':'}
                            states={[
                                {name: 'all', caption: i18n('value_all')},
                                {name: 'running', caption: i18n('value_running')},
                                {name: 'completed', caption: i18n('value_completed')},
                                {name: 'failed', caption: i18n('value_failed')},
                                {name: 'aborted', caption: i18n('value_aborted')},
                            ]}
                            disabled={showCompetitiveJobs}
                            width={200}
                        />
                    </div>
                    <div className={block('toolbar-attributes', tbComp)}>
                        <JobsAttributesFilter disabled={showCompetitiveJobs} width={200} />
                    </div>

                    <JobsOperationIncarnationsFilter
                        disabled={showCompetitiveJobs}
                        wrap={(children) => {
                            return (
                                <div className={block('toolbar-state', tbComp)}>{children} </div>
                            );
                        }}
                    />

                    <div className={block('toolbar-pagination', tbComp)}>
                        <JobsPaginator disabled={showCompetitiveJobs} />
                    </div>
                </div>
            </div>
        </div>
    );
}
