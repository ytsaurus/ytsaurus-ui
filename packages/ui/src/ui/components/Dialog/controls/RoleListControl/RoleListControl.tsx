import React from 'react';
import cn from 'bem-cn-lite';
import _ from 'lodash';

import {
    EditableListItemType,
    EditableManyLists,
    EditableManyListsItemType,
} from '@gravity-ui/dialog-fields';

import {UserCard} from '../../../UserLink/UserLink';
import {ResponsibleType, RoleConverted} from '../../../../utils/acl/acl-types';
import SubjectsControl from '../../../ACL/SubjectsControl/SubjectsControl';
import './RoleListControl.scss';
import {PreparedRole} from '../../../../utils/acl';

const block = cn('role-list-control');

interface Props {
    className?: string;
    value: {
        newItems: Array<ResponsibleType>;
        current: EditableManyListsItemType<RoleConverted>;
        toAdd: EditableManyListsItemType<RoleConverted>;
        toRemove: EditableManyListsItemType<RoleConverted>;
        unrecognized: EditableManyListsItemType<RoleConverted>;
    };

    onChange: (value: Props['value']) => void;
    placeholder?: string;
    maxVisibleCount: number;
    allowedTypes?: Array<'users' | 'groups'>;
}

export default class RoleListControl extends React.Component<Props> {
    static defaultProps = {
        maxVisibleCount: 3,
    };

    static getDefaultValue() {
        return {
            newItems: [],
            current: {title: '', data: []},
            toAdd: {title: '', data: []},
            toRemove: {title: '', data: []},
            unrecognized: {title: '', data: []},
        };
    }

    static isEmpty() {
        return false;
    }

    static prepareManyListData(value: Props['value']) {
        const {current, toAdd, toRemove, unrecognized} = value;
        return [{...current}, toAdd, toRemove, unrecognized].filter(
            (item) => item.data && item.data.length > 0,
        );
    }

    onSubejctsControlChange = (newItems?: Props['value']['newItems']) => {
        const {value, onChange} = this.props;
        onChange({
            ...value,
            newItems: newItems as any,
        });
    };

    onManyListsChange = (arr: Array<EditableManyListsItemType<RoleConverted>>) => {
        const [current] = arr;
        if (!current) {
            return;
        }
        const {value, onChange} = this.props;
        onChange({
            ...value,
            current,
        });
    };

    renderItem = (item: EditableListItemType<RoleConverted>) => {
        const {title, data} = item;
        const {type} = data || {};

        return type === 'users' ? <UserCard userName={title} /> : title;
    };

    render() {
        const {className, value, placeholder, maxVisibleCount, allowedTypes} = this.props;

        const manyListsData = RoleListControl.prepareManyListData(value);

        return (
            <div className={block(null, className)}>
                <SubjectsControl
                    onChange={this.onSubejctsControlChange as any}
                    value={value.newItems || []}
                    placeholder={placeholder}
                    allowedTypes={allowedTypes}
                />
                {manyListsData.length > 0 && (
                    <EditableManyLists
                        className={block('many-lists')}
                        value={manyListsData}
                        titleClassName={block('many-lists-title')}
                        onChange={this.onManyListsChange}
                        maxVisibleCount={maxVisibleCount}
                        itemRenderer={this.renderItem}
                    />
                )}
            </div>
        );
    }
}

export function prepareRoleListValue(roles: Array<PreparedRole>, otherMembers: Array<string> = []) {
    const current: typeof roles = [];
    const toAdd: typeof roles = [];
    const toRemove: typeof roles = [];
    const unrecognized: typeof roles = [];
    _.forEach(roles, (item) => {
        const {isUnrecognized, isRequested, isApproved, isDepriving} = item;
        if (isUnrecognized) {
            unrecognized.push(item);
        } else if (isDepriving) {
            toRemove.push(item);
        } else if (isApproved || isRequested) {
            toAdd.push(item);
        } else {
            current.push(item);
        }
    });

    const currentArr = current.map((item) => prepareItemOfCurrent(item));
    const otherArr = otherMembers.map((item) => ({
        title: item,
        data: {},
        frozen: true,
    }));

    return {
        newItems: [],
        current: {title: 'Current', data: currentArr.concat(otherArr)},
        toAdd: {
            title: 'Will be added',
            itemClassName: block('item-to-add'),
            data: toAdd.map((item) => prepareItemOfCurrent(item, {frozen: true})),
        },
        toRemove: {
            title: 'Will be removed',
            itemClassName: block('item-to-remove'),
            data: toRemove.map((item) => prepareItemOfCurrent(item, {frozen: true})),
        },
        unrecognized: {
            title: 'Unrecognized',
            itemClassName: block('item-unrecognized'),
            data: unrecognized.map((item) => prepareItemOfCurrent(item, {frozen: true})),
        },
    };
}

function prepareItemOfCurrent(role: PreparedRole, extraProps: any = {}) {
    return {
        title: role.text || role.value,
        data: role,
        ...extraProps,
    };
}

export function roleListValueToSubjectList(value: Props['value']): Array<ResponsibleType> {
    const {current, newItems, toAdd} = value;
    return [
        ...newItems,
        ...manyListDataItemToSubjectList(current),
        ...manyListDataItemToSubjectList(toAdd),
    ];
}

function manyListDataItemToSubjectList(
    manyListDataItem: EditableManyListsItemType<RoleConverted>,
): Array<ResponsibleType> {
    const {data} = manyListDataItem || {};
    return _.map(
        _.filter(data, ({removed}) => !removed),
        ({data}) => {
            const {type, value} = data || {};
            return {type: type!, value: value!};
        },
    );
}

export function extractChangedSubjects(value: {
    current: EditableManyListsItemType<RoleConverted>;
    newItems: Array<ResponsibleType>;
}) {
    const {current, newItems} = value;
    const added = newItems || [];
    const removed = ((current && current.data) || []).filter(({removed}) => removed);
    return {
        added: added.map(({type, value}) => {
            return type === 'users' ? {user: value} : {group: value};
        }),
        removed: removed.map(({data}) => {
            const {value, type} = data || {};
            return type === 'users' ? {user: value} : {group: value};
        }),
    };
}
