import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {updateJobsOperationIncarnationFilter} from '../../../../../../store/actions/operations/jobs-operation-incarnations';
import OperationSelectFilter from '../../../../../../pages/operations/OperationSelectFilter/OperationSelectFilter';
import {
    getJobsOperationIncarnactionsFilter,
    getJobsOperationIncarnactionsValues,
} from '../../../../../../store/selectors/operations/jobs';

export function JobsOperationIncarnationsFilter({
    disabled,
    wrap,
}: {
    disabled: boolean;
    wrap: (node: React.ReactNode) => React.ReactNode;
}) {
    const dispatch = useDispatch();

    const filter = useSelector(getJobsOperationIncarnactionsFilter);
    const values = useSelector(getJobsOperationIncarnactionsValues);

    return !values?.length
        ? null
        : wrap(
              <OperationSelectFilter
                  name="incarnaction"
                  states={values.map((name) => ({name, caption: name}))}
                  disabled={disabled}
                  width={'auto'}
                  value={filter}
                  updateFilter={(_name: unknown, value: string) => {
                      dispatch(updateJobsOperationIncarnationFilter(value));
                  }}
                  hideClear={false}
                  hideFilter={false}
              />,
          );
}
