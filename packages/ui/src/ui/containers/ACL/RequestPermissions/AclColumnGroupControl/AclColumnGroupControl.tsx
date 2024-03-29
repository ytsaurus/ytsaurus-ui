import React from 'react';

import {AclColumnGroup} from '../../../../utils/acl/acl-types';
import {Select, SelectOption} from '@gravity-ui/uikit';

export type Props = {
    value?: AclColumnGroup['id'];
    onChange: (value?: Props['value']) => void;
    columnGroups?: Array<AclColumnGroup>;
    disabled?: boolean;
};

export function AclColumnGroupControl({value, onChange, columnGroups, disabled}: Props) {
    const options = React.useMemo(() => {
        return columnGroups?.reduce((acc, data) => {
            if (!data.removed) {
                acc.push({
                    value: data.id,
                    content: data.name,
                    data,
                });
            }
            return acc;
        }, [] as Array<SelectOption<AclColumnGroup>>);
    }, [columnGroups]);

    return (
        <Select
            placeholder="Select column group"
            value={value ? [value] : []}
            disabled={disabled}
            options={options}
            onUpdate={(values) => onChange(values[0])}
            width="max"
        />
    );
}

AclColumnGroupControl.isEmpty = (value?: Props['value']) => {
    return !value?.length;
};

AclColumnGroupControl.getDefaultValue = () => {
    return undefined;
};
