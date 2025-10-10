import React, {Fragment, useCallback} from 'react';
import {useDispatch, useSelector} from '../../../../../../store/redux-hooks';

import cn from 'bem-cn-lite';
import map_ from 'lodash/map';
import identity_ from 'lodash/identity';

import Select from '../../../../../../components/Select/Select';
import JobsSuggestFilter from './JobsSuggestFilter';
import JobsTextFilter from './JobsTextFilter';
import {updateListJobsFilter} from '../../../../../../store/actions/operations/jobs';
import {getFilterValue} from '../../../../selectors';
import i18n from './i18n';

const block = cn('operation-detail-jobs');

function JobsFilterBy() {
    const filterBy = useSelector(getFilterValue('filterBy'));
    const dispatch = useDispatch();

    const handleChange = useCallback(
        (value: string) => {
            dispatch(updateListJobsFilter({name: 'filterBy', value}));
        },
        [dispatch],
    );

    return (
        <Fragment>
            <div className={block('toolbar-filter-by-select')}>
                <Select
                    value={filterBy ? [filterBy] : []}
                    items={map_(['address', 'id', 'monitoring_descriptor'], (value) => {
                        const textMap: Record<string, string> = {
                            address: i18n('value_address'),
                            id: i18n('value_id'),
                            monitoring_descriptor: i18n('value_monitoring-descriptor'),
                        };
                        return {value, text: textMap[value]};
                    })}
                    onUpdate={(vals) => handleChange(vals[0])}
                    pin="round-clear"
                    width="max"
                    hideFilter
                />
            </div>
            <div className={block('toolbar-filter-by-value')}>
                {filterBy === 'address' && (
                    <JobsSuggestFilter
                        name="address"
                        statesProvider={identity_}
                        pin={'brick-round'}
                    />
                )}
                {filterBy === 'id' && (
                    <JobsTextFilter
                        filterName="jobId"
                        placeholder={i18n('placeholder_filter-id')}
                        pin={'brick-round'}
                    />
                )}
                {filterBy === 'monitoring_descriptor' && (
                    <JobsTextFilter
                        filterName="monitoringDescriptor"
                        placeholder={i18n('placeholder_filter-monitoring-descriptor')}
                        pin={'brick-round'}
                    />
                )}
            </div>
        </Fragment>
    );
}

export default JobsFilterBy;
