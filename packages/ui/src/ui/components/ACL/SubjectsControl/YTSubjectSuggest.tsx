import React from 'react';
import {useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import {getAllGroupNames, getAllUserNames} from '../../../store/selectors/global';
import Select from '../../Select/Select';
import {UserName} from '../../UserLink/UserLink';
import {useAllUserNamesFiltered, useGroupsLoaded} from '../../../hooks/global';
import {SubjectsControlProps, ValueWithType} from './SubjectsControl';

import './YTSubjectSuggest.scss';
import LabelsGroup from '../../LabelsGroup/LabelsGroup';

const block = cn('yt-subject-suggest');

export function YTSubjectSuggest({className, value, onChange, ...rest}: SubjectsControlProps) {
    useAllUserNamesFiltered();
    useGroupsLoaded();

    const userNames = useSelector(getAllUserNames);
    const userItems = React.useMemo(() => {
        return userNames.sort().map((name) => {
            return {value: name, text: <UserName userName={name} />};
        });
    }, [userNames]);
    const userValue = React.useMemo(() => {
        return value.filter(({type}) => type === 'users');
    }, [value]);

    const groupNames = useSelector(getAllGroupNames);
    const groupItems = React.useMemo(() => {
        return groupNames.sort().map((name) => {
            return {value: name, text: name};
        });
    }, [groupNames]);
    const groupValue = React.useMemo(() => {
        return value.filter(({type}) => type === 'groups');
    }, [value]);

    const handleUsersChange = React.useCallback(
        (newValues: string[]) => {
            const newUsersValues: ValueWithType[] = newValues.map((val) => {
                return {
                    value: val,
                    text: val,
                    type: 'users',
                };
            });
            return onChange([...newUsersValues, ...groupValue]);
        },
        [groupValue, onChange],
    );

    const handleGroupChange = React.useCallback(
        (newValues: string[]) => {
            const newGroupsValues: ValueWithType[] = newValues.map((val) => {
                return {
                    value: val,
                    text: val,
                    type: 'groups',
                };
            });
            return onChange([...newGroupsValues, ...userValue]);
        },
        [userValue, onChange],
    );

    const handleRemoveValue = React.useCallback(
        ({name}: {name: string}) => {
            return onChange([...value.filter((el) => el.value !== name)]);
        },
        [value, onChange],
    );

    return (
        <div className={block()}>
            <Select
                {...rest}
                placeholder={'Enter user name or login...'}
                className={className}
                multiple
                value={userValue.map((el) => el.value)}
                items={userItems}
                onUpdate={handleUsersChange}
                maxVisibleValues={4}
                width={'max'}
            />
            <LabelsGroup
                items={userValue.map((el) => ({name: el.value}))}
                itemsCount={4}
                onRemoveAll={() => {}}
                onRemove={handleRemoveValue}
            />
            <Select
                {...rest}
                placeholder={'Enter group name...'}
                className={className}
                multiple
                value={groupValue.map((el) => el.value)}
                items={groupItems}
                onUpdate={handleGroupChange}
                maxVisibleValues={4}
                width={'max'}
            />
            <LabelsGroup
                items={groupValue.map((el) => ({name: el.value}))}
                itemsCount={4}
                onRemoveAll={() => {}}
                onRemove={handleRemoveValue}
            />
        </div>
    );
}
