import React from 'react';
import {useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import keys_ from 'lodash/keys';

import hammer from '../../../../../../common/hammer';
import JobsSelectFilter from './JobsSelectFilter';
import JobsPaginator from './JobsPaginator';
import JobsFilterBy from './JobsFilterBy';
import JobsAttributesFilter from './JobsAttributesFilter';

import {getShowCompetitiveJobs} from '../../../../../../pages/operations/selectors';
import {getOperationTasksNames} from '../../../../../../store/selectors/operations/operation';

import './OperationJobsToolbar.scss';

const block = cn('operation-detail-jobs');
const tbBlock = cn('elements-toolbar');

// TODO: make this a selector inside a specific <JobsTypeFilter> component once we start using reselect library
function extractJobTypes(operations) {
    const initialTypes = ['all'];

    const typeCounters = operations.jobs.filters.type.counters;
    return hammer.utils.sortInPredefinedOrder(initialTypes, keys_(typeCounters));
}

const tbComp = tbBlock('component');

export default function OperationJobsToolbar() {
    const showCompetitiveJobs = useSelector(getShowCompetitiveJobs);

    const taskNames = useSelector(getOperationTasksNames);
    const allTaskNames = React.useMemo(() => {
        return [
            '',
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
                        <JobsSelectFilter name={'taskName'} states={allTaskNames} width="max" />
                    </div>
                    <div className={block('toolbar-state', tbComp)}>
                        <JobsSelectFilter
                            name="type"
                            statesProvider={extractJobTypes}
                            disabled={showCompetitiveJobs}
                            width={200}
                        />
                    </div>
                    <div className={block('toolbar-state', tbComp)}>
                        <JobsSelectFilter
                            name="state"
                            states={['all', 'running', 'completed', 'failed', 'aborted']}
                            disabled={showCompetitiveJobs}
                            width={200}
                        />
                    </div>
                    <div className={block('toolbar-attributes', tbComp)}>
                        <JobsAttributesFilter disabled={showCompetitiveJobs} width={200} />
                    </div>

                    <div className={block('toolbar-pagination', tbComp)}>
                        <JobsPaginator disabled={showCompetitiveJobs} />
                    </div>
                </div>
            </div>
        </div>
    );
}
