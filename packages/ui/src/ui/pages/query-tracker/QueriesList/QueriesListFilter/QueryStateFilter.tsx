import React, {FC, useCallback} from 'react';
import {Select} from '@gravity-ui/uikit';
import {QueryStatus} from '../../../../types/query-tracker';
import hammer from '../../../../common/hammer';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {applyFilter} from '../../../../store/actions/query-tracker/queriesList';
import {getQueriesFilters} from '../../../../store/selectors/query-tracker/queriesList';

const ALL_STATUS_KEY = '__all';
const statusesList = [
    {
        value: ALL_STATUS_KEY,
        content: 'All',
    },
    ...Object.values(QueryStatus).map((i) => {
        return {
            value: i,
            content: hammer.format.Readable(i),
        };
    }),
];

export const QueryStateFilter: FC = () => {
    const dispatch = useDispatch();
    const {state} = useSelector(getQueriesFilters);

    const onChangeStatusFilter = useCallback(
        (values: string[]) => {
            const selectedStatus = values[0];
            const result =
                selectedStatus === ALL_STATUS_KEY ? undefined : (selectedStatus as QueryStatus);
            dispatch(applyFilter({state: result}));
        },
        [dispatch],
    );

    return (
        <Select
            width="max"
            options={statusesList}
            value={[state || ALL_STATUS_KEY]}
            onUpdate={onChangeStatusFilter}
            placeholder="Select status"
        />
    );
};
