import React from 'react';
import map_ from 'lodash/map';
import reduce_ from 'lodash/reduce';
import sortBy_ from 'lodash/sortBy';
import cn from 'bem-cn-lite';

import PathEditor from '../../../../containers/PathEditor/PathEditor';
import {EditableList} from '@gravity-ui/dialog-fields';

import './EditablePathList.scss';
import {FIX_MY_TYPE} from '../../../../types';

const block = cn('editable-path-list');

interface Props {
    value: Array<string>;
    defaultPath?: string;
    placeholder?: string;
    onChange: (value: Props['value']) => void;
}

export default class EditablePathList extends React.Component<Props> {
    static getDefaultValue() {
        return EditableList.getDefaultValue();
    }

    static isEmpty(value: Props['value']) {
        return !value?.length;
    }

    onListChange = (value: FIX_MY_TYPE) => {
        const newValue = reduce_(
            value,
            (acc, {title, removed}) => {
                if (!removed) {
                    acc.push(title);
                }
                return acc;
            },
            [] as Props['value'],
        );
        this.props.onChange(newValue);
    };

    onPathEditorChange = (...args: any) => {
        const [path] = args;
        const {value = [], onChange} = this.props;
        const newValue = [...value, path].sort();
        onChange(newValue);
    };

    render() {
        const {value, defaultPath, placeholder} = this.props;
        const listItems = map_(sortBy_(value), (path) => {
            return {title: path};
        });
        return (
            <div className={block()}>
                <PathEditor
                    placeholder={placeholder}
                    defaultPath={defaultPath}
                    onApply={this.onPathEditorChange}
                />
                <EditableList
                    className={block('list')}
                    value={listItems}
                    onChange={this.onListChange}
                />
            </div>
        );
    }
}
