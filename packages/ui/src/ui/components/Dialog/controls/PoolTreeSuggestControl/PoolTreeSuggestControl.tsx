import React from 'react';
import {useSelector} from 'react-redux';
import map_ from 'lodash/map';

import {Select} from '@gravity-ui/uikit';

import {DialogControlProps} from '../../../../components/Dialog/Dialog.types';
import {getAllPoolTreeNames} from '../../../../store/selectors/global';

type Props = DialogControlProps<string> & {disabled?: boolean};

export function PoolTreeSuggestControl(props: Props) {
    const {value, onChange, disabled, placeholder} = props;
    const treeNames = useSelector(getAllPoolTreeNames);

    const items = React.useMemo(() => {
        return map_(treeNames, (value) => {
            return {value, content: value};
        });
    }, [treeNames]);

    return (
        <Select
            disabled={disabled}
            value={[value]}
            options={items}
            onUpdate={(values) => onChange(values[0])}
            placeholder={placeholder}
            width="max"
            disablePortal
            filterable={items?.length > 5}
        />
    );
}

PoolTreeSuggestControl.getDefaultValue = () => {
    return '';
};

PoolTreeSuggestControl.isEmpty = (value: Props['value']) => {
    return !value;
};
