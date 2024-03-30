import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';
import {changeApproversSubjectFilter} from '../../../store/actions/acl-filters';
import {getApproversSubjectFilter} from '../../../store/selectors/acl-filters';
import {Toolbar} from '../../../components/WithStickyToolbar/Toolbar/Toolbar';
import Filter from '../../../components/Filter/Filter';
import './ApproversFilters.scss';

const block = cn('approvers-filters');

export default function ApproversFilters() {
    const dispatch = useDispatch();
    const subjectFilter = useSelector(getApproversSubjectFilter);

    return (
        <Toolbar
            itemsToWrap={[
                {
                    node: (
                        <Filter
                            placeholder="Filter by subject"
                            onChange={(value: string) => {
                                dispatch(changeApproversSubjectFilter({approversSubject: value}));
                            }}
                            className={block('subject-filter')}
                            value={subjectFilter}
                            size="m"
                        />
                    ),
                },
            ]}
        />
    );
}
