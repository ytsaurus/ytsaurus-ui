import cn from 'bem-cn-lite';

import filter_ from 'lodash/filter';
import forEach_ from 'lodash/forEach';
import map_ from 'lodash/map';

import type {EditableManyListsItemType} from '../../../../components/Dialog';
import type {ResponsibleType, RoleConverted} from '../../../../utils/acl/acl-types';
import type {PreparedRole} from '../../../../utils/acl';
import {RoleListControlProps} from './RoleListControl';

export const block = cn('role-list-control');

export function prepareRoleListValue(roles: Array<PreparedRole>, otherMembers: Array<string> = []) {
    const current: typeof roles = [];
    const toAdd: typeof roles = [];
    const toRemove: typeof roles = [];
    const unrecognized: typeof roles = [];
    forEach_(roles, (item) => {
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

export function roleListValueToSubjectList(
    value: RoleListControlProps['value'],
): Array<ResponsibleType> {
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
    return map_(
        filter_(data, ({removed}) => !removed),
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
