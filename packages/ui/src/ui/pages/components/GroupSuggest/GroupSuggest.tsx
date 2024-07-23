import {EditableList, EditableListItemType} from '@gravity-ui/dialog-fields';
import React from 'react';
import {connect} from 'react-redux';

import concat_ from 'lodash/concat';
import filter_ from 'lodash/filter';
import map_ from 'lodash/map';

import cn from 'bem-cn-lite';

import {SelectProps} from '@gravity-ui/uikit';

import {getAllGroupNamesSorted, getAllIdmGroupNamesSorted} from '../../../store/selectors/global';
import {RootState} from '../../../store/reducers';
import Select from '../../../components/Select/Select';

import './GroupSuggest.scss';

const block = cn('group-suggest');

interface Props {
    placeholder?: string;
    items?: Array<string>;
    className?: string;
    showTags?: boolean;
    idmOnly?: boolean;
    multiple?: boolean;
    value: Array<string>;
    onChange: (value: Props['value']) => void;
    disabled?: boolean;
    width?: SelectProps['width'];
    maxVisibleValues?: number;
}

function GroupSuggest(props: Props) {
    const {items, width, multiple, onChange, placeholder, className, showTags, value, ...rest} =
        props;

    const ycItems = map_(items, (item) => ({
        value: item,
        text: item,
    }));

    const empty = !value?.length;

    const listValue = React.useMemo(() => map_(concat_([], value), (title) => ({title})), [value]);

    const onListChange = React.useCallback(
        (newList: Array<EditableListItemType<any>>) => {
            const res = filter_(newList, ({removed}) => !removed).map(({title}) => title);
            onChange(res);
        },
        [value, onChange],
    );

    return (
        <div className={block({empty}, className)}>
            <Select
                {...rest}
                items={ycItems}
                onUpdate={onChange}
                placeholder={placeholder}
                value={props.value}
                multiple={multiple}
                width={width ?? 'max'}
                filterable
                disablePortal
            />
            {multiple && showTags && <EditableList onChange={onListChange} value={listValue} />}
        </div>
    );
}

GroupSuggest.isEmpty = (value: Array<string>) => {
    return !value?.length;
};

GroupSuggest.getDefaultValue = () => {
    return [];
};

const mapStateToProps = (state: RootState, ownProps: Props) => {
    const {idmOnly} = ownProps;
    const items: Array<string> = idmOnly
        ? (getAllIdmGroupNamesSorted(state) as Array<string>)
        : getAllGroupNamesSorted(state);
    return {items};
};

export default connect(mapStateToProps)(GroupSuggest);
