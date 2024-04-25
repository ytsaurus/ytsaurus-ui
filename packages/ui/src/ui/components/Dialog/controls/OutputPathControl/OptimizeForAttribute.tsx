import React, {FC} from 'react';
import {Attribute} from '../../../../store/reducers/navigation/modals/tableMergeSortModalSlice';
import {RadioButton} from '@gravity-ui/uikit';

const options = [
    {value: 'scan', content: 'Scan'},
    {value: 'lookup', content: 'Lookup'},
];

type Props = {
    attribute: Attribute;
    onChange: (attribute: Attribute) => void;
};
export const OptimizeForAttribute: FC<Props> = ({attribute, onChange}) => {
    if (!attribute.active) return null;

    const handleAttributeUpdate = (value: string) => {
        onChange({...attribute, value});
    };

    return (
        <>
            <div>Optimize for:</div>
            <RadioButton
                defaultValue={attribute.value}
                onUpdate={handleAttributeUpdate}
                options={options}
            />
        </>
    );
};
