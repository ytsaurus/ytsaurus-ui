import React from 'react';
import {useSelector} from '../../../../store/redux-hooks';
import map_ from 'lodash/map';

import {Select} from '@gravity-ui/uikit';

import {DialogControlProps} from '../../../../components/Dialog/Dialog.types';
import {getAllPoolTreeNames} from '../../../../store/selectors/global';
import {usePoolTreesLoaded} from '../../../../hooks/global-pool-trees';

type Props = DialogControlProps<string[]> & {
    disabled?: boolean;
    multiple?: boolean;
};

export function PoolTreeSuggestControl(props: Props) {
    const {value, onChange, disabled, placeholder, multiple} = props;
    const treeNames = useSelector(getAllPoolTreeNames);

    usePoolTreesLoaded();

    const items = React.useMemo(() => {
        return map_(treeNames, (value) => {
            return {value, content: value};
        });
    }, [treeNames]);

    return (
        <Select
            disabled={disabled}
            value={value}
            options={items}
            onUpdate={onChange}
            placeholder={placeholder}
            width="max"
            filterable={items?.length > 5}
            multiple={multiple}
        />
    );
}

PoolTreeSuggestControl.getDefaultValue = () => {
    return [];
};

PoolTreeSuggestControl.isEmpty = (value: Props['value']) => {
    return !value.length;
};
