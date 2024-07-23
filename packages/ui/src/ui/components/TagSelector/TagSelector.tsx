import React from 'react';
import map_ from 'lodash/map';

import cn from 'bem-cn-lite';

import Select from '../../components/Select/Select';
const block = cn('tag-selector');

export interface TagSelectorValue {
    concatBy: 'AND' | 'OR';
    items: Array<string>;
}

type SelectProps = React.ComponentProps<typeof Select>;

export interface TagSelectorProps {
    className?: string;

    value?: Array<string>;
    onChange: (v: TagSelectorProps['value']) => void;

    items?: Array<string>;

    placeholder?: string;
    pin?: SelectProps['pin'];
}

function TagSelector(props: TagSelectorProps) {
    const {className, onChange, items, placeholder, value, ...rest} = props;

    const options = React.useMemo(() => {
        return map_(items, (value) => ({value, text: value}));
    }, [items]);

    return (
        <div className={block(null, className)}>
            <Select
                {...rest}
                value={value || []}
                multiple
                onUpdate={onChange}
                items={options}
                placeholder={placeholder}
                width="max"
                maxVisibleValues={3}
            />
        </div>
    );
}

export default React.memo(TagSelector);
