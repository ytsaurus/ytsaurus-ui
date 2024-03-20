import React from 'react';

import '../../../../utils/acl/acl-types';
import {AclColumnGroup} from '../../../../utils/acl/acl-types';
import {Checkbox, Flex, Select, SelectOption} from '@gravity-ui/uikit';

export type Props = {
    value?: AclColumnGroup['id'];
    onChange: (value?: Props['value']) => void;
    columnGroups?: Array<AclColumnGroup>;
    disabled?: boolean;
};

export function AclColumnGroupControl({value, onChange, columnGroups, disabled}: Props) {
    const [checked, setChecked] = React.useState(Boolean(value));

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
        <Flex gap="4" alignItems="baseline">
            <Checkbox
                checked={checked}
                disabled={disabled}
                onChange={() => {
                    setChecked(!checked);
                    onChange();
                }}
            >
                Read column group
            </Checkbox>

            <Flex grow>
                <Select
                    placeholder="Select column group"
                    value={value ? [value] : []}
                    disabled={!checked || disabled}
                    options={options}
                    onUpdate={(values) => onChange(values[0])}
                    width="max"
                />
            </Flex>
        </Flex>
    );
}

AclColumnGroupControl.isEmpty = (value?: Props['value']) => {
    return !value?.length;
};

AclColumnGroupControl.getDefaultValue = () => {
    return undefined;
};
