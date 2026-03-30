import React from 'react';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import cn from 'bem-cn-lite';
import {changeApproversSubjectFilter} from '../../../store/actions/acl-filters';
import {selectApproversSubjectFilter} from '../../../store/selectors/acl/acl-filters';
import {Toolbar} from '../../../components/WithStickyToolbar/Toolbar/Toolbar';
import Filter from '../../../components/Filter/Filter';
import i18n from './i18n';
import './ApproversFilters.scss';

const block = cn('approvers-filters');

export default function ApproversFilters() {
    const dispatch = useDispatch();
    const subjectFilter = useSelector(selectApproversSubjectFilter);

    return (
        <Toolbar
            itemsToWrap={[
                {
                    node: (
                        <Filter
                            placeholder={i18n('field_subject-filter')}
                            onChange={(value: string) => {
                                dispatch(changeApproversSubjectFilter({approversSubject: value}));
                            }}
                            className={block('subject-filter')}
                            value={subjectFilter}
                            size="m"
                            autofocus={false}
                        />
                    ),
                },
            ]}
        />
    );
}
