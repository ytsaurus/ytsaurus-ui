import React from 'react';
import {useSelector} from 'react-redux';

import {getAllUserNames} from '../../store/selectors/global';
import Select from '../../components/Select/Select';
import {SubjectName} from '../../components/SubjectLink/DefaultSubjectLink';
import {useAllUserNamesFiltered} from '../../hooks/global';
import {UserSuggestProps} from './UserSuggest';

export function YTUserSuggest({className, value, onUpdate, multiple, ...rest}: UserSuggestProps) {
    const userNames = useSelector(getAllUserNames);
    const items = React.useMemo(() => {
        return userNames.sort().map((name) => {
            return {value: name, text: <SubjectName name={name} />};
        });
    }, [userNames]);

    useAllUserNamesFiltered();

    return (
        <Select
            {...rest}
            className={className}
            multiple={multiple}
            value={value}
            items={items}
            onUpdate={onUpdate}
        />
    );
}
