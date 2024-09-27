import React, {ComponentProps} from 'react';

import map_ from 'lodash/map';

import cn from 'bem-cn-lite';
import {useDispatch, useSelector} from 'react-redux';

import {getTabletCellBundlesSuggests} from '../../../store/selectors/suggests';
import {loadUsableTabletCellBundlesSuggests} from '../../../store/actions/suggests';
import Select from '../../../components/Select/Select';

const block = cn('tablet-cell-bundles-suggest');

interface Props
    extends Omit<ComponentProps<typeof Select>, 'value' | 'onChange' | 'onUpdate' | 'items'> {
    value?: string;
    onChange: (value?: string) => void;
}

function TabletCellBundlesSuggest(props: Props) {
    const items = useSelector(getTabletCellBundlesSuggests);
    const dispatch = useDispatch();
    React.useEffect(() => {
        dispatch(loadUsableTabletCellBundlesSuggests());
    }, []);

    const {onChange, placeholder, ...rest} = props;
    const value = props.value;

    const ycItems = map_(items, (item) => ({
        value: item,
        text: item,
    }));

    return (
        <div className={block({empty: !value})}>
            <Select
                {...rest}
                items={ycItems}
                onUpdate={(vals) => onChange(vals[0])}
                placeholder={placeholder}
                value={value ? [value] : undefined}
                width="max"
                disablePortal
            />
        </div>
    );
}

TabletCellBundlesSuggest.isEmpty = (value: string) => {
    return !value;
};

TabletCellBundlesSuggest.getDefaultValue = () => {
    return '';
};

export default TabletCellBundlesSuggest;
