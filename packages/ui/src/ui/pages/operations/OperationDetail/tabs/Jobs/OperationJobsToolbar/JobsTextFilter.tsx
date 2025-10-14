import React, {useCallback} from 'react';
import {useDispatch, useSelector} from '../../../../../../store/redux-hooks';

import Filter from '../../../../../../components/Filter/Filter';

import {updateListJobsFilter} from '../../../../../../store/actions/operations/jobs';
import {getFilterValue} from '../../../../selectors';
import type {JobsState} from '../../../../../../store/reducers/operations/jobs/jobs';

type StringFilterKeys = {
    [K in keyof JobsState['filters']]: JobsState['filters'][K]['value'] extends string ? K : never;
}[keyof JobsState['filters']];

type JobsTextFilterProps = {
    filterName: StringFilterKeys;
    placeholder: string;
    pin: React.ComponentProps<typeof Filter>['pin'];
};

function JobsTextFilter({filterName, placeholder, pin}: JobsTextFilterProps) {
    const value = useSelector(getFilterValue(filterName));
    const dispatch = useDispatch();

    const handleChange = useCallback(
        (val: string) => {
            dispatch(updateListJobsFilter({name: filterName, value: val}));
        },
        [dispatch, filterName],
    );

    return (
        <Filter
            size="m"
            placeholder={placeholder}
            onChange={handleChange}
            value={value ?? ''}
            pin={pin}
        />
    );
}

export default JobsTextFilter;
