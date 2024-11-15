import React from 'react';

import {
    EditableListItemType,
    EditableManyLists,
    EditableManyListsItemType,
} from '@gravity-ui/dialog-fields';

import {SubjectCard} from '../../../SubjectLink/SubjectLink';
import {ResponsibleType, RoleConverted} from '../../../../utils/acl/acl-types';
import SubjectsControl from '../../../../containers/ACL/SubjectsControl/SubjectsControl';

import './RoleListControl.scss';

import {block} from './utils';

export interface RoleListControlProps {
    className?: string;
    value: {
        newItems: Array<ResponsibleType>;
        current: EditableManyListsItemType<RoleConverted>;
        toAdd: EditableManyListsItemType<RoleConverted>;
        toRemove: EditableManyListsItemType<RoleConverted>;
        unrecognized: EditableManyListsItemType<RoleConverted>;
    };

    onChange: (value: RoleListControlProps['value']) => void;
    placeholder?: string;
    maxVisibleCount?: number;
    allowedTypes?: Array<'users' | 'groups'>;
}

export default class RoleListControl extends React.Component<RoleListControlProps> {
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

    static prepareManyListData(value: RoleListControlProps['value']) {
        const {current, toAdd, toRemove, unrecognized} = value;
        return [{...current}, toAdd, toRemove, unrecognized].filter(
            (item) => item.data && item.data.length > 0,
        );
    }

    onSubejctsControlChange = (newItems?: RoleListControlProps['value']['newItems']) => {
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

        return type === 'users' ? <SubjectCard name={title} /> : title;
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
