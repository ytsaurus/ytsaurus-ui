import React from 'react';
import {useSelector} from 'react-redux';
import _ from 'lodash';

import {Select} from '@gravity-ui/uikit';

import {DialogControlProps} from '../../../../components/Dialog/Dialog.types';
import {getAllPoolTreeNames} from '../../../../store/selectors/global';

type Props = DialogControlProps<string>;

export function PoolTreeSuggestControl(props: Props) {
    const {value, onChange, placeholder} = props;
    const treeNames = useSelector(getAllPoolTreeNames);

    const items = React.useMemo(() => {
        return _.map(treeNames, (value) => {
            return {value, content: value};
        });
    }, [treeNames]);

    return (
        <Select
            value={[value]}
            options={items}
            onUpdate={(values) => onChange(values[0])}
            placeholder={placeholder}
            width="max"
            disablePortal
        />
    );
}

PoolTreeSuggestControl.getDefaultValue = () => {
    return '';
};

PoolTreeSuggestControl.isEmpty = (value: Props['value']) => {
    return !value;
};
