import React, {FC} from 'react';
import {Attribute} from '../../../../store/reducers/navigation/modals/tableMergeSortModalSlice';
import {SegmentedRadioGroup} from '@gravity-ui/uikit';

import i18n from './i18n';

const options = [
    {value: 'scan', content: i18n('value_scan')},
    {value: 'lookup', content: i18n('value_lookup')},
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
            <div>{i18n('field_optimize-for')}</div>
            <SegmentedRadioGroup
                defaultValue={attribute.value}
                onUpdate={handleAttributeUpdate}
                options={options}
            />
        </>
    );
};
