import React from 'react';

import {Select, SelectOption} from '@gravity-ui/uikit';
import i18n from './i18n';

export type AclGroupItem = {
    id: string;
    name: string;
    removed?: boolean;
};

export type Props = {
    value?: AclGroupItem['id'];
    onChange: (value?: Props['value']) => void;
    options?: Array<AclGroupItem>;
    disabled?: boolean;
};

export function AclGroupControl({value, onChange, options, disabled}: Props) {
    const items = React.useMemo(() => {
        return options?.reduce(
            (acc, data) => {
                if (!data.removed) {
                    acc.push({
                        value: data.id,
                        content: data.name,
                        data,
                    });
                }
                return acc;
            },
            [] as Array<SelectOption<AclGroupItem>>,
        );
    }, [options]);

    return (
        <Select
            placeholder={i18n('context_select-group-placeholder')}
            value={value ? [value] : []}
            disabled={disabled}
            options={items}
            onUpdate={(values) => onChange(values[0])}
            width="max"
        />
    );
}

AclGroupControl.isEmpty = (value?: Props['value']) => {
    return !value?.length;
};

AclGroupControl.getDefaultValue = () => {
    return undefined;
};
