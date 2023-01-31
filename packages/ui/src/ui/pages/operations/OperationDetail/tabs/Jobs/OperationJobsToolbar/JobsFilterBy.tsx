import React, {Fragment, useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import cn from 'bem-cn-lite';
import _map from 'lodash/map';
import _identity from 'lodash/identity';

import Select from '../../../../../../components/Select/Select';
import JobsSuggestFilter from './JobsSuggestFilter';
import Filter from '../../../../../../components/Filter/Filter';

import {updateFilter} from '../../../../../../store/actions/operations/jobs';
import {getFilterValue} from '../../../../selectors';

const block = cn('operation-detail-jobs');

function JobsIdFilter({pin}: Pick<React.ComponentProps<typeof Filter>, 'pin'>) {
    const value = useSelector(getFilterValue('jobId'));
    const dispatch = useDispatch();
    const handleChange = useCallback((value: string) => {
        dispatch(updateFilter('jobId', value));
    }, []);

    return (
        <Filter
            size="m"
            placeholder="Filter id..."
            onChange={handleChange}
            value={value}
            pin={pin}
        />
    );
}

function JobsFilterBy() {
    const filterBy = useSelector(getFilterValue('filterBy'));
    const dispatch = useDispatch();
    const handleChange = useCallback((value: string) => {
        dispatch(updateFilter('filterBy', value));
    }, []);

    return (
        <Fragment>
            <div className={block('toolbar-filter-by-select')}>
                <Select
                    value={[filterBy]}
                    items={_map(['address', 'id'], (value) => {
                        return {value};
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
                        statesProvider={_identity}
                        pin={'brick-round'}
                    />
                )}
                {filterBy === 'id' && <JobsIdFilter pin={'brick-round'} />}
            </div>
        </Fragment>
    );
}

export default JobsFilterBy;
