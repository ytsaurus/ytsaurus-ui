import React from 'react';
import {useSelector} from '../../../../store/redux-hooks';

import map_ from 'lodash/map';

import cn from 'bem-cn-lite';

import {getCreatePoolDialogFlatTreeItems} from '../../../../store/selectors/scheduling/create-pool-dialog';
import Select from '../../../../components/Select/Select';

const block = cn('accounts-suggest');

interface Props {
    placeholder?: string;
    value: string;
    onChange: (value: Props['value']) => void;
    error?: React.ReactNode;
    validate?: (v: Props['value']) => React.ReactNode;
}

export default function CreatePoolParentSuggest(props: Props) {
    const {onChange, placeholder, value, error, ...rest} = props;

    const {sortedFlatTree} = useSelector(getCreatePoolDialogFlatTreeItems);

    const ycItems = map_(sortedFlatTree, (item) => ({
        value: item,
        text: item,
    }));

    return (
        <div className={block({empty: !value, error: Boolean(error)})}>
            <Select
                {...rest}
                items={ycItems}
                onUpdate={(vals) => onChange(vals[0])}
                placeholder={placeholder}
                value={value ? [value] : undefined}
                width="max"
            />
            {error && <div className={block('error')}>{error}</div>}
        </div>
    );
}

CreatePoolParentSuggest.isEmpty = (value: string) => {
    return !value;
};

CreatePoolParentSuggest.getDefaultValue = () => {
    return '';
};

CreatePoolParentSuggest.hasErrorRenderer = true;
