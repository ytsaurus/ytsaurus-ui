import React from 'react';
import {useDispatch, useSelector} from '../../../../../../store/redux-hooks';
import cn from 'bem-cn-lite';

import {updateJobsOperationIncarnationFilter} from '../../../../../../store/actions/operations/jobs-operation-incarnations';
import OperationSelectFilter from '../../../../../../pages/operations/OperationSelectFilter/OperationSelectFilter';
import {
    getJobsOperationIncarnationsFilter,
    getJobsOperationIncarnationsValues,
} from '../../../../../../store/selectors/operations/jobs';

import './JobsOperationsIncarnationsFilter.scss';

const block = cn('yt-jobs-incarnation-filter');

export function JobsOperationIncarnationsFilter({
    disabled,
    wrap,
}: {
    disabled: boolean;
    wrap: (node: React.ReactNode) => React.ReactNode;
}) {
    const dispatch = useDispatch();

    const filter = useSelector(getJobsOperationIncarnationsFilter);
    const values = useSelector(getJobsOperationIncarnationsValues);

    return !values?.length
        ? null
        : wrap(
              <OperationSelectFilter
                  name="incarnation"
                  states={values.map((name) => ({name, caption: name}))}
                  disabled={disabled}
                  width={'auto'}
                  value={filter}
                  updateFilter={(_name: unknown, value: string) => {
                      dispatch(updateJobsOperationIncarnationFilter(value));
                  }}
                  hideClear={false}
                  hideFilter={false}
                  popupClassName={block('popup')}
              />,
          );
}
